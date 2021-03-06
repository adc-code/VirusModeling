function D3SVGApp ()
{
    // The data...
    var dataFile = 'ONTCovidTesting.csv';

    // UI state
    var DataLength = 21;
    var barPadding = 2;
    var Catagories = [ 1, 2, 3, 4, 8, 11, 13 ];
    var ColumnIdx  = [ 4, 5, 6, 7, 12, 15, 17 ];

    var ToolTipLabels = [ 'New Infections: ', 'Cases Resolved: ', 'Additional Deaths: ',
                          'New Cases: ',  'Hospitalized: ', 'New LTC Infections: ', 'Additional LTC Deaths: '];

    var AddSpace   = [ 3, 4 ]; 

    // ??? start data date

    var Differences = [];
    var rangeValues = [];

    var colours     = d3.schemeCategory10;
    var colourIndex = [ 0, 1, 2, 3, 0, 0, 2 ];
         
    var currSelected = 0;


    // SVG Width, height, and some added spacing
    var w         = 550;
    var h         = 300;
    var padding   =  30;

    // Empty, for now
    var dataset, xScale, yScale;

    var updateDuration = 500;  


    //
    // Function used to parse the CSV.  
    // 
    var rowConverter = function (d) 
    {
        // console.log (d);

        // This isn't the best piece of code... perhaps there is a better way to deal with NAs
        if (d['Confirmed Positive'] == '')
            d['Confirmed Positive'] = 0;

        if (d['Resolved'] == '')
            d['Resolved'] = 0;
                 
        if (d['Deaths'] == '')
            d['Deaths'] = 0;
               
        if (d['Total Cases'] == '')
            d['Total Cases'] = 0;

        if (d['Total patients approved for testing as of Reporting Date'] == '')
            d['Total patients approved for testing as of Reporting Date'] = 0;

        if (d['Total tests completed in the last day'] == '')
            d['Total tests completed in the last day'] = 0;

        if (d['Under Investigation'] == '')
            d['Under Investigation'] = 0; 

        if (d['Number of patients hospitalized with COVID-19'] == '')
            d['Number of patients hospitalized with COVID-19'] = 0;
                   
        if (d['Number of patients in ICU with COVID-19'] == '')
            d['Number of patients in ICU with COVID-19'] = 0;

        if (d['Number of patients in ICU on a ventilator with COVID-19'] == '')
            d['Number of patients in ICU on a ventilator with COVID-19'] = 0;

        if (d['Total Positive LTC Resident Cases'] == '')
            d['Total Positive LTC Resident Cases'] = 0;

        if (d['Total Positive LTC HCW Cases'] == '')
            d['Total Positive LTC HCW Cases'] = 0;

        if (d['Total LTC Resident Deaths'] == '')
            d['Total LTC Resident Deaths'] = 0;

        if (d['Total LTC HCW Deaths'] == '')
            d['Total LTC HCW Deaths'] = 0;

        if (d['Percent positive tests in last day'] == '')
            d['Percent positive tests in last day'] = 0;


        return [
            // Note that we need to convert to the correct timezone
            new Date (new Date (d['Reported Date']).getTime() + 1000*60*60*5),          //  0
            parseInt (d['Confirmed Positive']),                                         //  1
            parseInt (d['Resolved']),                                                   //  2
            parseInt (d['Deaths']),                                                     //  3
            parseInt (d['Total Cases']),                                                //  4
            parseInt (d['Total patients approved for testing as of Reporting Date']),   //  5 
            parseInt (d['Total tests completed in the last day']),                      //  6
            parseInt (d['Under Investigation']),                                        //  7
            parseInt (d['Number of patients hospitalized with COVID-19']),              //  8
            parseInt (d['Number of patients in ICU with COVID-19']),                    //  9
            parseInt (d['Number of patients in ICU on a ventilator with COVID-19']),    // 10
            parseInt (d['Total Positive LTC Resident Cases']),                          // 11
            parseInt (d['Total Positive LTC HCW Cases']),                               // 12
            parseInt (d['Total LTC Resident Deaths']),                                  // 13
            parseInt (d['Total LTC HCW Deaths'])                                        // 14
        ];

    };


    //
    // Read the CSV...
    //
    d3.csv (dataFile, rowConverter).then (function (data) 
    {
        // Print data to console as table, for verification
        // console.table (data);

        //for (var i = 0; i < data['columns'].length; i++)
        //    console.log (i + '  ' + data['columns'][i])

        // Executed once the CSV has been read in...
        dataset = data;

        // Used to determine the range...
        var anyNegative = false;
        var anyPositive = false;
        var minValues   = [];
        var maxValues   = [];

        // Compute Differences
        var startIndex = dataset.length - DataLength;
        for (var i = 0; i < Catagories.length; i++)
        {
            var diff = [];
            for (var j = startIndex; j < dataset.length; j++)
            {
                diff.push ( dataset[ j ][ Catagories[i] ] - dataset[ j - 1 ][ Catagories[i] ] );
            }

            // console.log ('Adding... ' + Catagories[i] + '  ' + data['columns'][ Catagories[i] ] );
            Differences.push (diff);

            minValues.push ( d3.min(diff) );
            maxValues.push ( d3.max(diff) );

            if ( d3.min(diff) < 0 || d3.max(diff) < 0 )
                anyNegative = true;
           
            if ( d3.min(diff) > 0 || d3.max(diff) > 0 )
                anyPositive = true;
        }

        //console.log (Differences);

        // Go through all the values and check to see if they have the same sign or not... basically we will have 
        // three ranges: 1) if all positive -> 0 to max; 2) if all negative -> min to 0; and 3) if a mix of
        // positive and negative -> -max to +max (or something like max (abs(min), abs(max))...).  We are going to
        // try to keep the ranges similar and have a symmetry thing going on.

        if (anyNegative == false && anyPositive == true)
        {
            for (var i = 0; i < maxValues.length; i++)
                rangeValues.push ( [ 0, Math.max( minValues[i], maxValues[i] ) ] );
        }
        else if (anyNegative == true && anyPositive == false)
        {
            for (var i = 0; i < maxValues.length; i++)
                rangeValues.push ( [ Math.min( minValues[i], maxValues[i] ), 0 ] );
        }
        else if (anyNegative == true && anyPositive == true)
        {
            for (var i = 0; i < maxValues.length; i++)
            {
                var maxLimit = Math.max ( Math.abs (minValues[i]), Math.abs (maxValues[i]) );
                rangeValues.push ( [ -1 * maxLimit, maxLimit ] );
            }
        }
        else
        {
            for (var i = 0; i < maxValues.length; i++)
                rangeValues.push ( [ 0, 0 ] );
        }

        //console.log (minValues);
        //console.log (maxValues);
        //console.log (rangeValues); 

        // 
        // Make UI buttons from the columns...
        // 
        var colNames = dataset ['columns'];
        for (var i = 0; i < ColumnIdx.length; i++)
        {
            //console.log (ColumnIdx[i] + '  ' + colNames[ColumnIdx[i]]);

            // Make a new div and add the column name to it
            var newDiv     = document.createElement ('div'); 
            var newPara    = document.createElement ('p'); 
            var newContent = document.createTextNode (colNames[ ColumnIdx[i] ]); 
                    
            // Specify class names, attributes, styles...
            newDiv.className = 'buttons lineBtn';
            newDiv.setAttribute ('id', 'btn_' + i);
            newDiv.setAttribute ('num', i);
            newDiv.setAttribute ('state', 0);

            if (i == currSelected)
            {
                newDiv.style.backgroundColor = colours [ colourIndex[i] ];
                newDiv.setAttribute ('state', 1);
            }

            newPara.appendChild (newContent);
            newDiv.appendChild (newPara);

            // If it is the current group, the show it, otherwise hide the elements...
            //if ( colGroupID[i] == currGroup)
            {
                newDiv.classList.add ('visible')
                var currentDiv = document.getElementById ('controls').appendChild (newDiv);
            } 

            if ( AddSpace.includes(i) )
            {
                var newDiv = document.createElement ('div');
                var newPara    = document.createElement ('p');
                newDiv.appendChild (newPara);
                newDiv.setAttribute ('style', 'height: 0px');
                document.getElementById ('controls').appendChild (newDiv);
            }

        } // for i in colNames...

        // Define the scales to convert our data to screen coordinates
        xScale = d3.scaleLinear ()
                   .domain ( [ 0, DataLength ] )
                   .range ( [1.5*padding, w] ); 

        yScale = d3.scaleLinear ()
                   .domain ( rangeValues[currSelected] )
                   .range ( [h - padding, padding] );

        // Create SVG element
        var svg = d3.select ('#graph')
                    .append ('svg')
                    .attr ('width', w + 0.5 * padding)   
                    .attr ('height', h + 1.8 * padding);   

        var LastElem  = dataset.length - 1;
        var TickIndex = [ 0, 7, 14, 21 ];
        var dateIndex = [];
        for (var i = TickIndex.length-1; i >= 0; i--)
            dateIndex.push ( LastElem - TickIndex[i] );

        // console.log(dateIndex);

        // Define X axis
        xAxis = d3.axisBottom ()
                  .scale (xScale)
                  .tickSize ( -h + 2*padding )
                  .tickValues ( [0, 7, 14, 21] )
                  .tickFormat ( function(d,i) { return dataset[dateIndex[i]][0].toDateString(); } );

        svg.append ('g')
           .attr ('class', 'x axis')
           .attr ('transform', 'translate(0,' + (h - padding) + ')')
           .call (xAxis)
           .selectAll ('text')  
           .style ('text-anchor', 'start')
           .attr ('dx', '0.5em')
           .attr ('dy', '0.1em')
           .attr ('transform', 'rotate(90)'); 

        // Define Y axis
        yAxis = d3.axisLeft ()
                  .scale (yScale)
                  .ticks (10);  

        svg.append ('g')
           .attr ('class', 'y axis')
           .attr ('transform', 'translate(' + 1.5*padding + ',0)')
           .call (yAxis);  

        svg.selectAll ('rect')
           .data (Differences[0])
           .enter ()
           .append ('rect')
           .attr ('x', function (d, i) 
           { 
               return ( xScale (i) + barPadding ); 
           } )
           .attr ('y', function (d, i)
           {
               if (d > 0)
                   return yScale(d);
               else 
                   return yScale(0);
           } )
           .attr ('width', function (d, i) 
           { 
               return (xScale(1) - xScale(0)) - 2*barPadding; 
           } )
           .attr ('height', function (d, i) 
           { 
               if (d != 0) 
                   return ( Math.abs(yScale(0) - yScale(d)) ); 
               else
               {
                   return 1;
               }
           } ) 
           .attr ('fill', function (d, i) 
           { 
               return colours [ colourIndex[0] ];
           } )
           .on ('mouseover', function(d, i)
           {
               var xPosition = parseFloat (d3.select(this).attr('x')) + (xScale(1) - xScale(0)) / 2;
               var yPosition = parseFloat (d3.select(this).attr('y')) + Math.abs(yScale(0) - yScale(d)) / 2;

               //console.log (d3.mouse(this));
               xPosition = d3.event.pageX; //d3.mouse(this)[0];
               yPosition = d3.mouse(this)[1];

               //console.log (xPosition + '   ' + yPosition);
               d3.select ('#tooltip')
                 .style ('left', xPosition + 'px')
                 .style ('top', yPosition + 'px')
                 .select ('#label').html ( function (d) 
                 {
                     var outputStr = '';
                     outputStr += dataset[ dataset.length - DataLength + i][0].toDateString(); 
                     outputStr += '<hr>';
                     outputStr += ToolTipLabels[currSelected] + '<strong>' + Differences [ currSelected ][ i ] + '</strong>';
                     return outputStr;
                 } );

               d3.select ('#tooltip').classed ('hidden', false);
           } )
           .on ('mouseout', function(d) 
           { 
               // Remove the tooltip
               d3.select ('#tooltip').classed ('hidden', true);
           } );


           //
           // Hide/Show line graphs...
           //
           d3.selectAll ('div.buttons').on ('click', function() 
           {
               var num   = +d3.select(this).node().getAttribute ('num');
               var state = +d3.select(this).node().getAttribute ('state'); 

               if (num != currSelected)
               {
                   d3.select('#btn_' + currSelected).node().style.backgroundColor = "#cccccc";
                   d3.select('#btn_' + currSelected).node().setAttribute ('state', 0);

                   d3.select(this).node().style.backgroundColor = colours[ colourIndex[num] ];
                   d3.select(this).node().setAttribute ('state', 1);
               }
               else 
               {
                   // do nothing...
                   return;
               }

               // adjust the scale
               yScale.domain ( rangeValues[num] )

               // Update y-axis
               svg.select ('.y.axis')
                  .transition ()
                  .duration (updateDuration)
                  .call (yAxis);

               svg.selectAll ('rect')
                  .data (Differences[num])
                  .transition ()
                  .delay ( function(d, i) { return i * 30; }) 
                  .duration (updateDuration)
                  .attr ('x', function (d, i) 
                  { 
                      return ( xScale (i) + barPadding ); 
                  } )
                  .attr ('y', function (d, i)
                  {
                      if (d > 0)
                          return yScale(d);
                      else
                          return yScale(0);
                  } )
                  .attr ('width', function (d, i) 
                  { 
                      return (xScale(1) - xScale(0)) - 2*barPadding; 
                  } )
                  .attr ('height', function (d, i) 
                  { 
                      if (d != 0)
                          return ( Math.abs(yScale(0) - yScale(d)) ); 
                      else
                          return 1; 
                  } ) 
                  .attr ('fill', function (d, i) 
                  { 
                      return colours [ colourIndex[num] ];
                  } );

               currSelected = num;

           });  // lineBtn CB function

    }); // CSV read

}



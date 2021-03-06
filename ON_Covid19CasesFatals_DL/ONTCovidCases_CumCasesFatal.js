function D3App ()
{
    // The data...
    var dataFile = 'ONCovidCases_PHUDailyChanges.csv';

    var dataset, xScale, yScale, xAxis, yAxis;

    var datasetBounds;
    var datasetMonthBounds;

    var dataRanges;
    var MaxValues;

    // reminder... we are looking at datasets 0, 1, 3, and 4
    var dataElems = [ 0, 1, 3, 4 ];

    // Used to map state ID to a specific row in the dataset
    var dataMapping = [ 3, 0, 1, 2 ];

    var selectedItem  = 0;
    var selectedPHU   = 0;

    var selectedTimeRange = 4;
    var selectedValue = '0_2020';

    var maxValueOffset = 2;

    var initialSelected = 'Toronto';

    var lineCurveStyle = d3.curveStepAfter;

    var colours = [ d3.interpolatePuBu (0.95),
                    d3.interpolatePuBu (0.95), 
                    d3.interpolateGreys (0.95),
                    d3.interpolateGreys (0.95) ];

    var TotalCases     = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    var RecoveredCases = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    var FatalCases     = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    var InfectedCases  = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
 
    var TotalText = '<strong> Total </strong> <hr>';

    // SVG Width, height, and some added spacing
    var margin = {
            top:    15,
            right:  30,
            bottom: 20,
            left:   40
    };

    var width  = 550 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;

    var updateDuration = 750;


    var dataMap = { 2: 'Algoma',                                   3: 'Brant',
                    4: 'Chatham-Kent',                             5: 'Durham',  
                    6: 'Eastern',                                  7: 'Grey Bruce',
                    8: 'Haldimand-Norfolk',                        9: 'Haliburton Kawartha Pineridge', 
                   10: 'Halton',                                  11: 'Hamilton', 
                   12: 'Hastings Prince Edward',                  13: 'Huron Perth', 
                   14: 'Kingston Frontenac Lennox & Addington',   15: 'Lambton', 
                   16: 'Leeds Grenville and Lanark',              17: 'Middlesex-London',
                   18: 'Niagara',                                 19: 'North Bay Parry Sound',
                   20: 'Northwestern',                            21: 'Ottawa', 
                   22: 'Peel',                                    23: 'Peterborough', 
                   24: 'Porcupine',                               25: 'Renfrew',      
                   26: 'Simcoe Muskoka',                          27: 'Southwestern', 
                   28: 'Sudbury',                                 29: 'Thunder Bay', 
                   30: 'Timiskaming',                             31: 'Toronto', 
                   32: 'Waterloo',                                33: 'Wellington Dufferin Guelph',
                   34: 'Windsor-Essex',                           35: 'York'  }
            

    //
    // used to parse the CSV file properly
    //
    var rowConverter = function (d) 
    {
        // console.log (d);

        return [
            new Date (new Date (d['Dates']).getTime() + 1000*60*60*5), parseInt(d['Type']),                            //  0  1
            parseFloat (d['Algoma']),                                  parseFloat (d['Brant']),                         //  2  3
            parseFloat (d['Chatham-Kent']),                            parseFloat (d['Durham']),                        //  4  5
            parseFloat (d['Eastern']),                                 parseFloat (d['Grey Bruce']),                    //  6  7
            parseFloat (d['Haldimand-Norfolk']),                       parseFloat (d['Haliburton Kawartha Pineridge']), //  8  9
            parseFloat (d['Halton']),                                  parseFloat (d['Hamilton']),                      // 10 11
            parseFloat (d['Hastings Prince Edward']),                  parseFloat (d['Huron Perth']),                   // 12 13
            parseFloat (d['Kingston Frontenac Lennox & Addington']),   parseFloat (d['Lambton']),                       // 14 15
            parseFloat (d['Leeds Grenville and Lanark']),              parseFloat (d['Middlesex-London']),              // 16 17
            parseFloat (d['Niagara']),                                 parseFloat (d['North Bay Parry Sound']),         // 18 19
            parseFloat (d['Northwestern']),                            parseFloat (d['Ottawa']),                        // 20 21
            parseFloat (d['Peel']),                                    parseFloat (d['Peterborough']),                  // 22 23
            parseFloat (d['Porcupine']),                               parseFloat (d['Renfrew']),                       // 24 25
            parseFloat (d['Simcoe Muskoka']),                          parseFloat (d['Southwestern']),                  // 26 27
            parseFloat (d['Sudbury']),                                 parseFloat (d['Thunder Bay']),                   // 28 29
            parseFloat (d['Timiskaming']),                             parseFloat (d['Toronto']),                       // 30 31
            parseFloat (d['Waterloo']),                                parseFloat (d['Wellington Dufferin Guelph']),    // 32 33
            parseFloat (d['Windsor-Essex']),                           parseFloat (d['York']),                          // 34 35
        ];  
    }


    //
    // Utility function to get the required data to draw
    //
    var ExtractData = function ( selectedItem, selectedPHU )
    {
        var results = [];

        for (var i = datasetBounds[ dataElems[selectedItem] ][0]; i <= datasetBounds[ dataElems[selectedItem] ][1]; i++)
            results.push ( [ dataset[i][ 0 ], dataset[i][ selectedPHU ] ] );

        return results;
    }



    //
    // Read the CSV...
    //
    d3.csv (dataFile, rowConverter).then (function (data) 
    {
        // console.log (data);            
        dataset = data;

        //
        // Determine the boundaries for all the data
        //
        datasetBounds = [ ];

        var startIndex = 0;
        for (var type = 1; type <= 6; type++)
        {
            var endIndex = dataset.length - 1;
            for (var i = startIndex; i < dataset.length; i++)
            {
                if (dataset[i][1] != type)
                {
                    endIndex = i-1;
                    break;
                }
            }

            datasetBounds.push ( [startIndex, endIndex] );
            startIndex = endIndex+1;
        }

        // console.log ('datasetBounds: ');                
        // console.log (datasetBounds);                

                
        // 
        // Determine the month range boundaries
        //
        datasetMonthBounds = [];
        for (var type = 0; type < datasetBounds.length; type++)
        {
            var typeMonthBounds = [];

            var startIndex = datasetBounds[type][0];
            var endIndex   = datasetBounds[type][1];
                  
            var monthIdx = startIndex;

            var done = false;
            while (!done)
            {
                var currMonth    = dataset[monthIdx][0].getMonth ();
                var currYear     = dataset[monthIdx][0].getFullYear ();
                var currMonthStr = dataset[monthIdx][0].toLocaleString('default', { month: 'long' });

                for (var i = startIndex; i <= datasetBounds[type][1]; i++)
                {
                    var iterMonth = dataset[i][0].getMonth ();

                    if (iterMonth != currMonth)
                    {
                        endIndex = i - 1;
                        monthIdx = i;
                        break;
                    }
                    else if (i == datasetBounds[type][1])
                    {
                        endIndex = datasetBounds[type][1];
                        done = true;
                        break;
                    }
                }

                // console.log (currMonthStr, startIndex, endIndex);
                typeMonthBounds.push ( [currMonthStr, currMonth, currYear, startIndex, endIndex] );

                startIndex = endIndex + 1;
            }

            datasetMonthBounds.push (typeMonthBounds); 
        } 
        // console.log ('datasetMonthBounds'); 
        // console.log (datasetMonthBounds); 


        //
        // Use the datasetBounds values to find the ranges of the data.
        //
        dataRanges = [ ];
        MaxValues  = [ ];

        for (var i = 0; i < dataElems.length; i++)
        {
            var range = [ dataset[ datasetBounds[ dataElems[i] ][0] ][0], 
                          dataset[ datasetBounds[ dataElems[i] ][1] ][0]  ];
            dataRanges.push (range);

            // in these cases, the max is the final line of the data
            if (i == 0 || i == 2)
            {
                var lastLine = dataset[ datasetBounds[ dataElems[i] ][1] ].slice ();
                lastLine.shift(); lastLine.shift(); 

                var updatedValues = [];
                for (var j = 0; j < lastLine.length; j++)
                    updatedValues.push (lastLine[j] > 0 ? lastLine[j] : 1);
                         
                MaxValues.push (updatedValues);    
            }
            else
            {
                var tmpMaxValues = dataset [ datasetBounds[ dataElems[i] ][0] ].slice ()
                tmpMaxValues.shift(); tmpMaxValues.shift(); 

                // Go through the elements and find the max
                for (var j = datasetBounds[ dataElems[i] ][0]; j < datasetBounds[ dataElems[i] ][1]; j++)
                {
                    for (var k = 2; k < dataset[0].length; k++)
                    {
                        if (dataset[j][k] > tmpMaxValues[k-2])
                            tmpMaxValues[k-2] = dataset[j][k];
                    }
                }

                var updatedValues = [];
                for (var j = 0; j < tmpMaxValues.length; j++)
                    updatedValues.push (tmpMaxValues[j] > 0 ? tmpMaxValues[j] : 1);

                MaxValues.push (updatedValues);
            }
        }
        // console.log ('MaxValues: ' + MaxValues); 
        // console.log ('dataRanges: ' + dataRanges);


        //
        // Populate the selector lists...
        //

        // Get the PHU Names...
        var requiredIndex = 0;
        var PHUSelectionList = document.getElementById ('PHU_SelList');
                
        var dataIndex = 2;
        for (var i = 0; i < dataset.columns.length; i++)
        {
            if (dataset.columns[i] == 'Dates' || dataset.columns[i] == 'Type' || dataset.columns[i] == 'Not Reported') 
                continue;

            var newOption = document.createElement ('option');

            newOption.text  = dataset.columns[i];
            newOption.value = dataIndex;

            if (newOption.text == initialSelected)
                selectedPHU = dataIndex;

            PHUSelectionList.options.add (newOption, i);

            dataIndex++;
        } 

        // and for the months...
        var MonthSelectionList = document.getElementById ('Month_SelList');
        for (var i = 0; i < datasetMonthBounds[0].length; i++)
        {
            var newOption = document.createElement ('option');
       
            newOption.text  = datasetMonthBounds[0][i][0] + ' ' + datasetMonthBounds[0][i][2];
            newOption.value = datasetMonthBounds[0][i][1] + '_' + datasetMonthBounds[0][i][2];

            MonthSelectionList.options.add (newOption, i);
        }


        //
        // Update the UI elements...
        //
        d3.select ('#PHU_SelList').property ('value', selectedPHU);

        d3.select ('#btnID_0').style ('background-color', colours[0]);
        d3.select ('#btnID_0').style ('color', '#ffffff');

        d3.select ('#btnID_4').style ('background-color', '#006600');
        d3.select ('#btnID_4').style ('color', '#ffffff');

        d3.select ('#Month_SelList').node().disabled = true;
        d3.select ('#Month_SelList').property ('value', selectedValue);                


        // Make the SVG
        var svg = d3.select ('#graph').append('svg')
                    .attr ('width', width + margin.left + margin.right)
                    .attr ('height', height + margin.top + margin.bottom)
                    .append ('g')
                    .attr ('transform', 'translate(' + margin.left + ',' + margin.top + ')');
 
        svg.append ('clipPath')
           .attr ('id', 'graphArea')
           .append ('rect')
           .attr ('x', -1)
           .attr ('y', -1)
           .attr ('width', width+2)
           .attr ('height', height+2);

        // Define the scales to convert our data to screen coordinates
        xScale = d3.scaleTime ()
                   .domain ( dataRanges[selectedItem] )
                   .range ( [ 0, width ] ); 

        yScale = d3.scaleLinear ()
                   .domain ( [ 0, MaxValues[selectedItem][selectedPHU - 2] ] )
                   .range ( [ height, 0 ] ); 

        xAxis = d3.axisBottom ()
                  .scale (xScale)
                  .ticks (7)
                  .tickFormat ( d3.timeFormat ('%b %d') );

        // Define Y axis
        yAxis = d3.axisLeft ()
                  .scale (yScale)
                  .ticks (10);

        // Create x axis..
        svg.append ('g')
           .attr ('class', 'x axis')
           .attr ('transform', 'translate(0,' + (height) + ')')
           .call (xAxis);

        // and y axis... 
        svg.append ('g')
           .attr ('class', 'y axis')
           .call (yAxis);  

        svg.append ('circle')
           .attr ('cx', 0)
           .attr ('cy', 0)
           .attr ('r', 4)
           .style ('fill', 'magenta')
           .attr ('opacity', 0)
           .attr ('id', 'tt_circ');

        var dataLine1 = d3.line ()
                          .x (function(d) { return xScale (d[0]); })
                          .y (function(d) { return yScale (d[1]); });

        var dataLine2 = d3.line ()
                          .x (function(d) { return xScale (d[0]); })
                          .y (function(d) { return yScale (d[1]); })
                          .curve (d3.curveStep); 

        var currentData = ExtractData ( selectedItem, selectedPHU );
                

        var pathData1 = svg.append ('path')
                           .datum (currentData)
                           .attr ('id', 'dataLine1')
                           .attr ('class', 'dataLine')
                           .attr ('clip-path', 'url(#graphArea)')
                           .attr ('stroke', colours [0] )
                           .attr ('fill', 'none')
                           .attr ('stroke-width', 2)
                           .attr ('d', dataLine1);

        var pathData2 = svg.append ('path')
                           .datum (currentData)
                           .attr ('id', 'dataLine2')
                           .attr ('class', 'dataLine')
                           .attr ('clip-path', 'url(#graphArea)')
                           .attr ('stroke', colours [0] )
                           .attr ('fill', 'none')
                           .attr ('stroke-width', 2)
                           .attr ('opacity', 0)
                           .attr ('d', dataLine2);


        //
        // LookUpDate : used to find the closest index in the dataset for a particular date
        //
        function LookUpDate (value, lowerIndex, upperIndex)
        {
            var midIndex = Math.round ( (upperIndex + lowerIndex) / 2 );

            // console.log (lowerIndex, upperIndex, midIndex);

            if ( value == dataset[midIndex][0] )
                return midIndex;

            if ( midIndex == lowerIndex )
                return lowerIndex;
            else if ( midIndex == upperIndex )
                return upperIndex;

            if (value >= dataset[lowerIndex][0] && value <= dataset[midIndex][0])
            {
                return LookUpDate (value, lowerIndex, midIndex);
            }
            else
            {
                return LookUpDate (value, midIndex, upperIndex);
            }
        }


        d3.selectAll ('.dataLine').on ('mousemove', function(d, i)
        {
            var xPosition = d3.mouse(this)[0];
            var yPosition = d3.mouse(this)[1];

            // Get the corresponding date...
            var selectedDate = xScale.invert (xPosition);

            // console.log (selectedDate.toDateString());

            // Lookup the closest day to this date...
            // So when going from pixels to a date, the xScale function nicely interpolates
            // the date values for you.  However the governments data has some missing days 
            // that we need to take into account.

            var index = LookUpDate ( selectedDate, datasetBounds[ dataElems[selectedItem] ][0], 
                                                   datasetBounds[ dataElems[selectedItem] ][1] );

            // console.log (index);

            var outputStr = dataset[index][0].toDateString ();
            outputStr += '<hr>';
            outputStr += dataset[index][selectedPHU];

            d3.select ('#tooltip')
              .style ('left', d3.event.pageX + 'px')
              .style ('top', (d3.event.pageY + 15) + 'px')
              .select ('#label').html ( outputStr );

            d3.select ('#tooltip').classed ('hidden', false); 

            d3.select ('#tt_circ')
              .attr ('cx', xScale (dataset[index][0]) )
              .attr ('cy', yScale (dataset[index][selectedPHU]) )
              .attr ('opacity', 1);

        } );


        d3.selectAll ('.dataLine').on ('mouseout', function(d, i)
        {
            // Hide the circle 
            d3.select ('#tt_circ').attr ('opacity', 0);

            // Remove the tooltip
            d3.select ('#tooltip').classed ('hidden', true);
        } );


        //
        // Used to redraw the graph
        //
        var UpdateGraph = function (selItem, selPHU)
        {
            // get the data...
            var currentData = ExtractData ( selItem, selPHU );

            // adjust the max value...
            yScale.domain ( [ 0, MaxValues[selItem][selPHU - 2] ] );

            // update the x axis range...
            //xScale.domain ( dataRanges[selItem] );
                   
            if (selectedTimeRange == 4)
            {
                xScale.domain ( dataRanges[selItem] );
            }
            else if (selectedTimeRange == 5)
            {
                var tokens = selectedValue.split ('_');
                var selectedMonth = Math.round (tokens [0]);
                var selectedYear  = Math.round (tokens [1]);

                var monthIndex = -1;
                for (var i = 0; i < datasetMonthBounds[ dataElems[selItem] ].length; i++)
                {
                    if ( datasetMonthBounds[ dataElems[selItem] ][i][1] == selectedMonth && 
                         datasetMonthBounds[ dataElems[selItem] ][i][2] == selectedYear )
                    {
                        monthIndex = i;
                        break;
                    }
                }
                         
                if (monthIndex >= 0)
                {      
                    xScale.domain ( [ dataset[ datasetMonthBounds[ dataElems[selItem] ][monthIndex][3] ][0],
                                      dataset[ datasetMonthBounds[ dataElems[selItem] ][monthIndex][4] ][0]  ] )
                }
            }

            // update the x-axis
            svg.select ('.x.axis')
               .transition ()
               .duration (updateDuration)
               .call (xAxis);

            // update the y-axis
            svg.select ('.y.axis')
               .transition ()
               .duration (updateDuration)
               .call (yAxis);

            if (selItem == selectedItem)
            {
                d3.select ('#dataLine1')
                  .transition ()
                  .duration (updateDuration)
                  .attr ('stroke', colours [selItem] )
                  .attr ('d', dataLine1 (currentData) );

                d3.select ('#dataLine2')
                  .transition ()
                  .duration (updateDuration)
                  .attr ('stroke', colours [selItem] )
                  .attr ('d', dataLine2 (currentData) );
            }
            else if ((selItem == 2 && selectedItem == 0) || (selItem == 0 && selectedItem == 2))
            {
                d3.select ('#dataLine1')
                  .transition ()
                  .duration (updateDuration/2)
                  .attr ('opacity', 0)
                  .transition ()
                  .duration (5)
                  .attr ('stroke', colours [selItem] )
                  .attr ('d', dataLine1 (currentData) )
                  .transition ()
                  .duration (updateDuration/2)
                  .attr ('opacity', 1);
                          
                d3.select ('#dataLine2')
                  .attr ('stroke', colours [selItem] )
                  .attr ('d', dataLine2 (currentData) );
            }
            else if ((selItem == 1 && selectedItem == 3) || (selItem == 3 && selectedItem == 1))
            {
                d3.select ('#dataLine1')
                  .attr ('stroke', colours [selItem] )
                  .attr ('d', dataLine1 (currentData) );

                d3.select ('#dataLine2')
                  .transition ()
                  .duration (updateDuration/2)
                  .attr ('opacity', 0)
                  .transition ()
                  .duration (5)
                  .attr ('stroke', colours [selItem] )
                  .attr ('d', dataLine2 (currentData) )
                  .transition ()
                  .duration (updateDuration/2)
                  .attr ('opacity', 1);
            } 
            else if ((selItem == 1 && selectedItem == 0) || (selItem == 3 && selectedItem == 2))
            {
                d3.select ('#dataLine1')
                  .transition ()
                  .duration (updateDuration)
                  .attr ('opacity', 0)
                  .attr ('stroke', colours [selItem] )
                  .attr ('d', dataLine1 (currentData) );

                d3.select ('#dataLine2')
                  .attr ('opacity', 1)
                  .transition ()
                  .duration (updateDuration)
                  .attr ('stroke', colours [selItem] )
                  .attr ('d', dataLine2 (currentData) );
            }
            else if ((selItem == 0 && selectedItem == 1) || (selItem == 2 && selectedItem == 3))
            {
                d3.select ('#dataLine1')
                  .transition ()
                  .duration (updateDuration)
                  .attr ('opacity', 1)
                  .attr ('stroke', colours [selItem] )
                  .attr ('d', dataLine1 (currentData) );

                d3.select ('#dataLine2')
                  .transition ()
                  .duration (updateDuration)
                  .attr ('opacity', 0)
                  .attr ('stroke', colours [selItem] )
                  .attr ('d', dataLine2 (currentData) );
            }
            else if (selItem == 3 && selectedItem == 0) 
            {
                d3.select ('#dataLine1')
                  .transition ()
                  .duration (updateDuration)
                  .attr ('opacity', 0)
                  .transition ()
                  .duration (5)
                  .attr ('stroke', colours [selItem] )
                  .attr ('d', dataLine1 (currentData) );

                d3.select ('#dataLine2')
                  .attr ('d', dataLine2 (currentData) )
                  .transition ()
                  .duration (updateDuration)
                  .attr ('opacity', 1)
                  .attr ('stroke', colours [selItem] );
            }
            else if (selItem == 0 && selectedItem == 3) 
            {
                d3.select ('#dataLine1')
                  .attr ('d', dataLine1 (currentData) )
                  .transition ()
                  .duration (updateDuration)
                  .attr ('opacity', 1)
                  .attr ('stroke', colours [selItem] );

                d3.select ('#dataLine2')
                  .transition ()
                  .duration (updateDuration)
                  .attr ('opacity', 0)
                  .transition ()
                  .duration (5)
                  .attr ('stroke', colours [selItem] )
                  .attr ('d', dataLine2 (currentData) );
            }
            else if (selItem == 2 && selectedItem == 1)
            {
                d3.select ('#dataLine1')
                  .attr ('stroke', colours [selItem] )
                  .attr ('d', dataLine1 (currentData) )
                  .transition ()
                  .duration (updateDuration)
                  .attr ('opacity', 1)

                d3.select ('#dataLine2')
                  .transition ()
                  .duration (updateDuration)
                  .attr ('opacity', 0)
                  .transition ()
                  .duration (5)
                  .attr ('stroke', colours [selItem] )
                  .attr ('d', dataLine2 (currentData) );
            }
            else if (selItem == 1 && selectedItem == 2)
            {
                d3.select ('#dataLine1')
                  .transition ()
                  .duration (updateDuration)
                  .attr ('opacity', 0)
                  .transition ()
                  .duration (5)
                  .attr ('stroke', colours [selItem] )
                  .attr ('d', dataLine1 (currentData) );

                d3.select ('#dataLine2')
                  .attr ('stroke', colours [selItem] )
                  .attr ('d', dataLine2 (currentData) )
                  .transition ()
                  .duration (updateDuration)
                  .attr ('opacity', 1);
            }

        };  // UpdateGraph


        //
        // Handle the various datatype buttons
        //
        d3.selectAll ('.datatype').on ('click', function()
        {
            var selBtnID = +d3.select(this).node().getAttribute ('stateID');

            if (selBtnID != selectedItem)
            {
                // update the UI
                d3.selectAll ('.datatype').style ('background-color', '#cccccc');
                d3.selectAll ('.datatype').style ('color', '#000000');
                d3.select ('#btnID_' + selBtnID).style ('background-color', colours[selBtnID]);
                d3.select ('#btnID_' + selBtnID).style ('color', '#ffffff');
            }
            else 
            {
                // do nothing...
                return;
            } 

            //console.log ('ON datatype... ' + selBtnID);

            var monSelList = document.getElementById ('Month_SelList');
            while (monSelList.options.length > 0)
            {                
                monSelList.remove (0);
            }                    

            var selMonthIndexAvail = false
            for (var i = 0; i < datasetMonthBounds[ dataElems[selBtnID] ].length; i++)
            {
                var newOption = document.createElement ('option');

                newOption.text  = datasetMonthBounds[ dataElems[selBtnID] ][i][0] + ' ' + datasetMonthBounds[ dataElems[selBtnID] ][i][2];
                newOption.value = datasetMonthBounds[ dataElems[selBtnID] ][i][1] + '_' + datasetMonthBounds[ dataElems[selBtnID] ][i][2];

                if (selectedValue == newOption.value)
                    selMonthIndexAvail = true;

                monSelList.options.add (newOption, i);
            }

            if (selMonthIndexAvail == false)
                selectedValue = datasetMonthBounds[ dataElems[selBtnID] ][0][1] + '_' + datasetMonthBounds[ dataElems[selBtnID] ][0][2];
                   
            d3.select ('#Month_SelList').property ('value', selectedValue);
 

            // Update the graph...
            UpdateGraph (selBtnID, selectedPHU);

            selectedItem = selBtnID;
        } );



        //
        // Callback to handle public health unit selection list change
        //
        d3.select ('#PHU_SelList').on ('change', function ()
        {
            //console.log ('OnChangePHU');
 
            selectedPHU = d3.select(this).property ('value');

            // Update the graph...
            UpdateGraph (selectedItem, selectedPHU);

            //console.log ('selectedPHU = ' + selectedPHU + '  ->  ' + dataMap[selectedPHU]);

        } ); 


        d3.selectAll ('.timeRange').on ('click', function ()
        {
            var selBtnID = +d3.select(this).node().getAttribute ('stateID');

            if (selBtnID != selectedTimeRange)
            {
                // update the UI
                d3.selectAll ('.timeRange').style ('background-color', '#cccccc');
                d3.selectAll ('.timeRange').style ('color', '#000000');
                d3.select ('#btnID_' + selBtnID).style ('background-color', '#006600');
                d3.select ('#btnID_' + selBtnID).style ('color', '#ffffff');

                d3.select ('#Month_SelList').node().disabled = selBtnID == 5 ? false : true;
            }
            else
            {
                // do nothing...
                return;
            }

            selectedTimeRange = selBtnID;

            // Update the graph
            UpdateGraph (selectedItem, selectedPHU);
                    
        } );


        d3.select ('#Month_SelList').on ('change', function ()
        {
            // console.log ('OnChangeMonth');

            selectedValue = d3.select(this).property ('value');

            // Update the graph
            UpdateGraph (selectedItem, selectedPHU);

        } );

    } )

}



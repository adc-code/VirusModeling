function D3App ()
{
    // The data...
    var dataFile = 'ONCovidCases_NotResolvedCounts.csv';

    var dataset, xScale, yScale, xAxis, yAxis;

    var colours = [ '#002db3', '#ccff33' ];

    var TotalText = '<strong> Total </strong> <hr>';

    // SVG Width, height, and some added spacing
    var margin = {
            top:    15,
            right:  10,
            bottom: 20,
            left:   40
    };

    var width  = 600 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;

    var updateDuration     = 400;
    var yAxisScalingFactor = 1.1;


    //
    // Function used to parse the CSV.  
    // 
    var rowConverter = function (d) 
    {
        //console.log (d);

        var timeZoneAdjustment = 1000*60*60*5; // in millisecs...

        return [  new Date (new Date (d['Date']).getTime() + timeZoneAdjustment), parseInt (d['Count']) ];  
    }


    //
    // Read the CSV...
    //
    d3.csv (dataFile, rowConverter).then (function (data) 
    {
        //console.log (data);            
        dataset = data;

        // Make the SVG
        var svg = d3.select ('#graph').append('svg')
                    .attr ('width', width + margin.left + margin.right)
                    .attr ('height', height + margin.top + margin.bottom)
                    .append ('g')
                    .attr ('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Define the scales to convert our data to screen coordinates
        var threeMonthWindow = 90 * 24 * 3600 * 1000;
        var currentTimeMs = Date.now();

        xScale = d3.scaleTime ()
                   .domain ( [ new Date (currentTimeMs - threeMonthWindow), 
                               d3.max (dataset, function(d) { return d[0]; })  ] )
                   .range ( [ 0, width ] );

        yScale = d3.scaleLinear ()
                   .domain ( [ d3.min (dataset, function(d) { return d[1]; }),
                               d3.max (dataset, function(d) { return d[1]; }) ] )
                   .range ( [ height, 0 ] );

        xAxis = d3.axisBottom ()
                  .scale (xScale)
                  .ticks (10);

        // Define Y axis
        yAxis = d3.axisLeft ()
                  .scale (yScale)
                  .ticks (10);

        svg.append ('g')
           .attr ('class', 'axis')
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

        var notResLine = d3.line ()
                           .x (function(d) { return xScale (d[0]); })
                           .y (function(d) { return yScale (d[1]); })
                           .curve (d3.curveStepAfter);

        var path_notRes_data = svg.append ('path')
                                  .datum (dataset)
                                  .attr ('id', 'notResLine')
                                  .attr ('stroke', colours [0] )
                                  .attr ('fill', 'none')
                                  .attr ('stroke-width', 2)
                                  .attr ('d', notResLine)
                                  .on ('mousemove', function(d, i)
                                      {
                                          // Get the mouse position
                                          var xPosition = d3.mouse(this)[0];
                                          var yPosition = d3.mouse(this)[1];
                          
                                          // Get the corresponding date...
                                          var selectedDate = xScale.invert (xPosition);

                                          // Lookup the closest day to this date...
                                          // So when going from pixels to a date, the xScale function nicely interpolates
                                          // the date values for you.  However the governments data has some missing days 
                                          // that we need to take into account.
                                          var dateValSelected = 100 * selectedDate.getMonth() + selectedDate.getDate();

                                          var index = 0;
                                          for (var i = 0; i < dataset.length; i++)
                                          {
                                              var dateValInDataset = 100 * dataset[i][0].getMonth() + dataset[i][0].getDate();
                                              if (dateValInDataset >= dateValSelected)
                                              {
                                                  index = i;
                                                  break;
                                               }
                                          }

                                          d3.select ('#tt_circ')
                                            .attr ('cx', xScale (dataset[index][0]) )
                                            .attr ('cy', yScale (dataset[index][1]) )
                                            .attr ('opacity', 1);
   
                                          d3.select ('#tooltip')
                                            .style ('left', (d3.event.pageX + 5) + 'px')
                                            .style ('top', (d3.mouse(this)[1] + 5) + 'px')
                                            .select ('#label').html ( function (d)
                                                {
                                                    var outputStr = '<strong> Date: </strong>' + dataset[index][0].toDateString ();
                                                    outputStr += '<hr>';
                                                    outputStr += '<strong> Count: </strong>' + dataset[index][1];
                                                    return outputStr;
                                                } );

                                          // show the tooltip
                                          d3.select ('#tooltip').classed ('hidden', false);  
                                      } )
                                  .on ('mouseout', function(d)
                                      {
                                          // Hide the circle 
                                          d3.select ('#tt_circ').attr ('opacity', 0);

                                          // Remove the tooltip
                                          d3.select ('#tooltip').classed ('hidden', true);
                                      } );

    } )

}




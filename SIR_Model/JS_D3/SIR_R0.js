function D3SVGApp ()
{
    const LOW  = 1;
    const HIGH = 2;

    const BETA  = 0;
    const GAMMA = 1;
    const SUS   = 2;

    const PREV_FADE_TIME  =  300;
    const CURR_TRANS_TIME = 1000;

    var timeStart  =   0;
    var timeEnd    =  50;
    var deltaT     = 0.1;

    // The number of datapoints
    var NumPoints  = Math.ceil ( (timeEnd - timeStart) / deltaT );

    var betaLow   = 0.4;
    var betaHigh  = 1.5;
    var gammaLow  = 0.15;
    var gammaHigh = 0.45;
    var susLow    = 0.44;
    var susHigh   = 0.99;

    var startBeta = betaHigh
    var endBeta   = betaHigh;

    var startGamma = gammaLow;
    var endGamma   = gammaLow;

    var startS0    = susHigh;
    var endS0      = susHigh;

    var btnState = [ HIGH, LOW, HIGH ];
       
    var UIEnable   = 1;  

    var t_0 = 0.00;
    var S_0 = susHigh;
    var I_0 = 0.01;
    var R_0 = 1.0 - S_0 - I_0;


    var dSdt = function (S, I, R, Beta, Gamma) 
    {
        return -Beta * S * I;
    };


    var dIdt = function (S, I, R, Beta, Gamma)
    {
        return Beta * S * I - Gamma * I
    };


    var dRdt = function (S, I, R, Beta, Gamma)
    {
        return Gamma * I
    };


    var ComputeValues = function (t_0, S_0, I_0, R_0, N, Beta, Gamma)
    {
        var t_n = t_0;
        var S_n = S_0;
        var I_n = I_0;
        var R_n = R_0;

        var Results   = [];
        Results.push ( {'t': t_0, 'S': S_0, 'I': I_0, 'R': R_0} );

        for (var i = 0; i < N; i++)
        {
            var k1 = deltaT * dSdt (S_n, I_n, R_n, Beta, Gamma);
            var l1 = deltaT * dIdt (S_n, I_n, R_n, Beta, Gamma);
            var m1 = deltaT * dRdt (S_n, I_n, R_n, Beta, Gamma);

            var k2 = deltaT * dSdt (S_n + 0.5*k1, I_n + 0.5*l1, R_n + 0.5*m1, Beta, Gamma);
            var l2 = deltaT * dIdt (S_n + 0.5*k1, I_n + 0.5*l1, R_n + 0.5*m1, Beta, Gamma);
            var m2 = deltaT * dRdt (S_n + 0.5*k1, I_n + 0.5*l1, R_n + 0.5*m1, Beta, Gamma);

            var k3 = deltaT * dSdt (S_n + 0.5*k2, I_n + 0.5*l2, R_n + 0.5*m2, Beta, Gamma);
            var l3 = deltaT * dIdt (S_n + 0.5*k2, I_n + 0.5*l2, R_n + 0.5*m2, Beta, Gamma);
            var m3 = deltaT * dRdt (S_n + 0.5*k2, I_n + 0.5*l2, R_n + 0.5*m2, Beta, Gamma);

            var k4 = deltaT * dSdt (S_n + k3, I_n + l3, R_n + m3, Beta, Gamma);
            var l4 = deltaT * dIdt (S_n + k3, I_n + l3, R_n + m3, Beta, Gamma);
            var m4 = deltaT * dRdt (S_n + k3, I_n + l3, R_n + m3, Beta, Gamma);

            S_n = S_n + 1/6 * (k1 + 2*k2 + 2*k3 + k4);
            I_n = I_n + 1/6 * (l1 + 2*l2 + 2*l3 + l4);
            R_n = R_n + 1/6 * (m1 + 2*m2 + 2*m3 + m4);
            t_n = t_n + deltaT;

            Results.push ( { 't': t_n, 'S': S_n, 'I': I_n, 'R': R_n } );
        }

        return Results;
    };

            
    //
    // D3 Stuff...
    //
    var margin = { top: 10, right: 45, bottom: 60, left: 70 };
    // var width  = 0.75 * window.innerWidth  - margin.left - margin.right;
    // var height = 0.75 * window.innerHeight - margin.top  - margin.bottom; 
    // var width  = 0.66 * window.innerWidth  - margin.left - margin.right;
    // var height = 0.66 * window.innerHeight - margin.top  - margin.bottom; 

    var width  = 530  - margin.left - margin.right;
    var height = 320  - margin.top  - margin.bottom; 

    var xScale = d3.scaleLinear ()
                   .domain ([timeStart, timeEnd])
                   .range ([0, width]); 

    var yScale = d3.scaleLinear ()
                   .domain ([0, 1]) 
                   .range ([height, 0]); 

    var lineS_Prev = d3.line ()
                       .x ( function (d) {  return xScale (d.t);  } )     
                       .y ( function (d) {  return yScale (d.S);  } )     
                       .curve ( d3.curveMonotoneX ) 

    var lineS_Curr = d3.line ()
                       .x ( function (d) {  return xScale (d.t);  } )     
                       .y ( function (d) {  return yScale (d.S);  } )     
                       .curve ( d3.curveMonotoneX ) 

    var lineI_Prev = d3.line ()
                       .x (function(d)    {  return xScale (d.t);  })    
                       .y (function(d)    {  return yScale (d.I);  })   
                       .curve (d3.curveMonotoneX) 

    var lineI_Curr = d3.line ()
                       .x (function(d)    {  return xScale (d.t);  })    
                       .y (function(d)    {  return yScale (d.I);  })   
                       .curve (d3.curveMonotoneX) 

    var lineR_Prev = d3.line ()
                       .x (function(d)    {  return xScale (d.t);  }) 
                       .y (function(d)    {  return yScale (d.R);  }) 
                       .curve (d3.curveMonotoneX) 

    var lineR_Curr = d3.line ()
                       .x (function(d)    {  return xScale (d.t);  }) 
                       .y (function(d)    {  return yScale (d.R);  }) 
                       .curve (d3.curveMonotoneX) 

    var currResults = ComputeValues (t_0, susHigh, I_0, R_0, NumPoints, betaHigh, gammaLow);

    var svg = d3.select ('div#graph')
                .append ('svg')
                .attr ('width', width + margin.left + margin.right)
                .attr ('height', height + margin.top + margin.bottom)
                .append ('g')
                .attr ('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.append ('g')
       .attr ('class', 'x axis')
       .attr ('transform', 'translate(0,' + height + ')')
       .call (d3.axisBottom (xScale));   

    svg.append ('g')
       .attr ('class', 'y axis')
       .call (d3.axisLeft (yScale).tickFormat (d => 100 * d + "%"));     

    svg.append ('g')
       .attr ('class', 'grid')
       .attr ('transform', 'translate (0,' + height + ')')
       .style ('stroke-dasharray', ('3,3'))
       .call (d3.axisBottom(xScale).ticks(8)
       .tickSize(-height)
       .tickFormat(''));

    svg.append ('g')
       .attr ('class', 'grid')
       .style ('stroke-dasharray', ('3,3'))
       .call (d3.axisLeft(yScale).ticks(10)
       .tickSize(-width)
       .tickFormat (''));

    svg.append ('path')
       .datum (currResults)         
       .attr ('class', 'lineI Curr') 
       .attr ('d', lineI_Curr);     

    svg.append ('path')
       .attr ('class', 'lineI Prev') 
       .style ('stroke-dasharray', ('3, 3'))
       .attr ('d', lineI_Prev (currResults) );     

    svg.append ('path')
       .datum (currResults)        
       .attr ('class', 'lineS Curr')
       .attr ('d', lineS_Curr);    

    svg.append ('path')
       .attr ('class', 'lineS Prev')
       .style ('stroke-dasharray', ('3, 3'))
       .attr ('d', lineS_Prev (currResults) ); 

    svg.append ('path')
       .datum (currResults)        
       .attr ('class', 'lineR Curr')
       .attr ('d', lineR_Curr);    

    svg.append ('path')
       .attr ('class', 'lineR Prev')
       .style ('stroke-dasharray', ('3, 3'))
       .attr ('d', lineR_Prev (currResults) );    


    var interpInfected = function ()
    {
        var interpBeta  = d3.interpolateNumber (startBeta,  endBeta);
        var interpGamma = d3.interpolateNumber (startGamma, endGamma);
        var interpSus   = d3.interpolateNumber (startS0,    endS0);

        return function (t)
        {
            return lineI_Curr ( ComputeValues (t_0, 
                                               interpSus(t), 
                                               I_0, 
                                               1.0 - I_0 - interpSus(t), 
                                               NumPoints, 
                                               interpBeta(t), 
                                               interpGamma(t) ) );
        };
    };


    var interpSuscepted = function ()
    {
        var interpBeta  = d3.interpolateNumber (startBeta,  endBeta);
        var interpGamma = d3.interpolateNumber (startGamma, endGamma);
        var interpSus   = d3.interpolateNumber (startS0,    endS0);

        return function (t)
        {
            return lineS_Curr ( ComputeValues (t_0, 
                                               interpSus(t), 
                                               I_0, 
                                               1.0 - I_0 - interpSus(t), 
                                               NumPoints, 
                                               interpBeta(t), interpGamma(t) ) );
        };
    };


    var interpRecovered = function ()
    {
        var interpBeta  = d3.interpolateNumber (startBeta,  endBeta);
        var interpGamma = d3.interpolateNumber (startGamma, endGamma);
        var interpSus   = d3.interpolateNumber (startS0,    endS0);

        return function (t)
        {
            return lineR_Curr (ComputeValues (t_0, 
                                              interpSus(t), 
                                              I_0, 
                                              1.0 - I_0 - interpSus(t), 
                                              NumPoints, 
                                              interpBeta(t), 
                                              interpGamma(t) ) );
        };
    };


    var updateGraph = function ()
    {
        if (btnState[BETA] == LOW)
            endBeta = betaLow;
        else if (btnState[BETA] == HIGH)
            endBeta = betaHigh;

        if (btnState[GAMMA] == LOW)
            endGamma = gammaLow;
        else if (btnState[GAMMA] == HIGH)
            endGamma = gammaHigh;

        if (btnState[SUS] == LOW)
            endS0 = susLow;
        else if (btnState[SUS] == HIGH)
            endS0 = susHigh;

        svg.select ('.lineS.Curr')
           .transition ()
           .duration (CURR_TRANS_TIME)
           .delay (PREV_FADE_TIME)
           .attrTween ('d', interpSuscepted);

        svg.select ('.lineR.Curr')
           .transition ()
           .duration (CURR_TRANS_TIME)
           .delay (PREV_FADE_TIME)
           .attrTween ('d', interpRecovered);

        svg.select ('.lineI.Curr')
           .transition ()
           .duration (CURR_TRANS_TIME)
           .delay (PREV_FADE_TIME)
           .attrTween ('d', interpInfected)
           .on ('end', function() 
           { 
               startBeta  = endBeta; 
               startGamma = endGamma; 
               startS0    = endS0; 

               currResults = ComputeValues (t_0, 
                                            endS0, 
                                            I_0, 
                                            1.0 - I_0 - endS0, 
                                            NumPoints, 
                                            endBeta, 
                                            endGamma);

               UIEnable = !UIEnable;
           } ); 
    };


    var updatePrev = function ()
    {
        svg.select ('.lineI.Prev')
           .transition ()
           .duration (PREV_FADE_TIME)
           .style ('opacity', 0.0)
           .on ('start', function () { UIEnable = !UIEnable;  console.log ('updatePrev -> lineI -> onStart'); } )
           .on ('end', function() 
           { 
               svg.select ('.lineI.Prev') .style ('opacity', 1.0) .attr ('d', lineI_Prev (currResults));  
           } ); 

           svg.select ('.lineS.Prev')
              .transition ()
              .duration (PREV_FADE_TIME)
              .style ('opacity', 0.0)
              .on ('start', function () { console.log ('updatePrev -> lineS -> onStart'); } )
              .on ('end', function() 
              { 
                  svg.select ('.lineS.Prev') .style ('opacity', 1.0) .attr ('d', lineS_Prev (currResults));  
              } ); 

           svg.select ('.lineR.Prev')
              .transition ()
              .duration (PREV_FADE_TIME)
              .style ('opacity', 0.0)
              .on ('start', function () { console.log ('updatePrev -> lineR -> onStart'); } )
              .on ('end', function() 
              { 
                  svg.select ('.lineR.Prev') .style ('opacity', 1.0) .attr ('d', lineR_Prev (currResults));  
              } ); 
    }


    //
    // Various callbacks
    //
    d3.select ('#LowBeta').on ('click', function()
    {
        if (btnState[BETA] != LOW && UIEnable == 1)
        {
            document.getElementById('LowBeta').className  = 'btn btnSelected';
            document.getElementById('HighBeta').className = 'btn';

            btnState[BETA] = LOW;

            updatePrev ();
            updateGraph ();
        }
    } );
         

    d3.select ('#HighBeta').on ('click', function()
    {
        if (btnState[BETA] != HIGH && UIEnable == 1)
        {
            document.getElementById('LowBeta').className  = 'btn';
            document.getElementById('HighBeta').className = 'btn btnSelected';

            btnState[BETA] = HIGH;

            updatePrev ();
            updateGraph ();
        }
    } );

         
    d3.select ('#LowGamma').on ('click', function()
    {
        if (btnState[GAMMA] != LOW)
        {
            document.getElementById('LowGamma').className  = 'btn btnSelected';
            document.getElementById('HighGamma').className = 'btn';

            btnState[GAMMA] = LOW;

            updatePrev ();
            updateGraph ();
        }
    } );

         
    d3.select ('#HighGamma').on ('click', function()
    {
        if (btnState[GAMMA] != HIGH)
        {
            document.getElementById('LowGamma').className  = 'btn';
            document.getElementById('HighGamma').className = 'btn btnSelected';

            btnState[GAMMA] = HIGH;

            updatePrev ();
            updateGraph ();
        } 
    } );

         
    d3.select ('#LowSus').on ('click', function()
    {
        if (btnState[SUS] != LOW)
        {
            document.getElementById('LowSus').className  = 'btn btnSelected';
            document.getElementById('HighSus').className = 'btn';

            btnState[SUS] = LOW;

            updatePrev ();
            updateGraph ();
        }
    } );

         
    d3.select ('#HighSus').on ('click', function()
    {
        if (btnState[SUS] != HIGH)
        {
            document.getElementById('LowSus').className  = 'btn';
            document.getElementById('HighSus').className = 'btn btnSelected';

            btnState[SUS] = HIGH;

            updatePrev ();
            updateGraph ();
        }
    } );

         
    svg.append ('text')
       .style ('text-anchor', 'middle')
       .attr ('transform', 'rotate(-90)')
       .attr ('x', -height * 0.5)
       .attr ('y', -margin.left * 0.66)
       .text ('Percent of Population')
       .attr ('class', 'axisLabel');

    svg.append ('text')
       .style ('text-anchor', 'left')
       .text ('Time')
       .attr ('x', xScale (timeEnd) + 0.2 * margin.right )
       .attr ('y', height + 0.2 * margin.bottom)
       .attr ('class', 'axisLabel');

    var legendColours = [ '#0033cc', '#ffab00', '#009933' ];
    var legendLabels  = [ 'Susceptible', 'Infected', 'Recovered' ];
    var legendStart   = 2.5;
    var legendOffset  = 15;

    for (var i = 0; i < 3; i++)
    {
        svg.append ('rect')
           .attr ('x', xScale (legendStart + legendOffset*i))
           .attr ('y', height + 0.5 * margin.bottom)
           .attr ('width', 10)
           .attr ('height', 10)
           .attr ('fill', legendColours[i]);

        svg.append ('text')
           .style ('text-anchor', 'left')
           .text (legendLabels[i])
           .attr ('x', xScale (legendStart + legendOffset*i) + 15)
           .attr ('y', height + 0.5 * margin.bottom + 10)
           .attr ('class', 'axisLabel');
    }

} 


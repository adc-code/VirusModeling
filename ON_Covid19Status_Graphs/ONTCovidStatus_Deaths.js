
function D3TableApp ()
{
    // The data...
    var dataFile = 'ONTCovidTesting.csv';

    var currIndex = 0;

    //
    // Function used to parse the CSV.  
    // 
    var rowConverter = function (d) 
    {
        //console.log (d);

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

        return {
            // Note that we need to convert to the correct timezone
            date:            new Date (new Date (d['Reported Date']).getTime() + 1000*60*60*5),
            confirmedPos:    parseInt (d['Confirmed Positive']),
            resolved:        parseInt (d['Resolved']),
            deaths:          parseInt (d['Deaths']),
            totalCases:      parseInt (d['Total Cases']),
            totalApproved:   parseInt (d['Total patients approved for testing as of Reporting Date']),
            totalCompleted:  parseInt (d['Total tests completed in the last day']),
            underInvest:     parseInt (d['Under Investigation']),
            numHosp:         parseInt (d['Number of patients hospitalized with COVID-19']),
            numHospICU:      parseInt (d['Number of patients in ICU with COVID-19']),
            numHospICUVent:  parseInt (d['Number of patients in ICU on a ventilator with COVID-19']),
            numLTCResCases:  parseInt (d['Total Positive LTC Resident Cases']),
            numLTCHCWCases:  parseInt (d['Total Positive LTC HCW Cases']),
            numLTCResDeaths: parseInt (d['Total LTC Resident Deaths']),
            numLTCHCWDeaths: parseInt (d['Total LTC HCW Deaths'])
        };

    };


    //
    // Read the CSV...
    //
    d3.csv (dataFile, rowConverter).then (function (data) 
    {
        // Print data to console as table, for verification
        // console.table (data);

        // Executed once the CSV has been read in...
        dataset = data;
      
        var colNames = dataset ['columns'];
        //for (var i = 0; i < colNames.length; i++)
        //    console.log (i + '  ' + colNames[i]);

        var table = document.getElementById ('dataCont');

        var newRow = table.insertRow ();
        var cellDate = newRow.insertCell ();
        cellDate.setAttribute ('colSpan', '2');
        cellDate.setAttribute ('id', 'DateLabel');
        cellDate.innerHTML = dataset[dataset.length - 1].date.toDateString ();

        var dataLabels = [ 'Total ' + colNames[6], 
                            colNames[16], 
                            'Non-LTC Deaths',
                            'Percent of LTC Deaths of Total',
                            'Total Resolved',
                            'Percent of Deaths of Total Resolved',
                            'Percent of Non-LTC Deaths of Total Resolved' ];

        var dataIDs = [ 'Deaths', 'LTCDeaths', 'NonLTCDeaths', 'PctLTCDeaths', 'Resolved', 'PctDeaths', 'PctNonLTCDeaths' ];


        var ComputeValues = function (i)
        {
            var Deaths       = dataset[i].deaths;
            var LTCDeaths    = dataset[i].numLTCResDeaths;
            var NonLTCDeaths = Deaths - LTCDeaths;

            var PctLTCDeaths = 0;
            if (Deaths != 0)
                PctLTCDeaths = LTCDeaths / Deaths * 100;

            var TotalResolved = dataset[i].resolved + Deaths;

            var PctDeathsToTotal = 0;
            if (TotalResolved != 0)
                PctDeathsToTotal = Deaths / TotalResolved * 100;

            var PctNonLTCDeathsToTotal = 0;
            if (TotalResolved != 0)
                PctNonLTCDeathsToTotal = NonLTCDeaths / TotalResolved * 100;
     
            return [ Deaths, 
                     LTCDeaths,
                     NonLTCDeaths,
                     PctLTCDeaths.toFixed (2) + ' %',
                     TotalResolved,
                     PctDeathsToTotal.toFixed (2) + ' %',
                     PctNonLTCDeathsToTotal.toFixed (2) + ' %' ]; 
        };

        currIndex = dataset.length - 1;
        var dataValues = ComputeValues (dataset.length - 1);


        var drawHLine = [ 0, 2, 4 ];

        for (var i = 0; i < dataLabels.length; i++)
        {
            var table = document.getElementById ('dataCont');

            if ( drawHLine.includes(i) )
            {
                var newRow = table.insertRow ();
                var cellSpace = newRow.insertCell ();
                cellSpace.setAttribute ('colSpan', '2');
                cellSpace.className = 'space';
            }

            var newRow = table.insertRow ();

            var cellLabel = newRow.insertCell (0);
            var cellValue = newRow.insertCell (1);
            cellValue.setAttribute ('id', dataIDs [i]);

            cellLabel.innerHTML = (dataLabels [i] + ':');
            cellValue.innerHTML = dataValues [i];
            cellValue.className = 'data';
        }

        table = document.getElementById ('dataCont');

        newRow = table.insertRow ();
        var cellSpace = newRow.insertCell ();
        cellSpace.setAttribute ('colSpan', '2');
        cellSpace.className = 'space';

        newRow = table.insertRow ();
        var cellBtns = newRow.insertCell ();
        cellBtns.setAttribute ('colSpan', '2');

        var ControlsStr = '';
        ControlsStr += '<div id="PrevDay" style="float:left" class="btn">Prev Day</div> ';
        ControlsStr += '<input style="float:left;" id="sliderDate" type="range" min="0" max="' 
                    + (dataset.length - 1) + '" step="1" value="' + (dataset.length - 1) + '"/> ';
        ControlsStr += '<div id="NextDay" style="float:right; margin-right: 0.5em;" class="btn">Next Day</div> ';
        cellBtns.innerHTML = ControlsStr;


        var UpdateUI = function (index)
        {
            // Update various labels...
            d3.select ('#DateLabel').node().innerText = dataset[index].date.toDateString ();

            var dataValues = ComputeValues (index);
            for (var i = 0; i < dataIDs.length; i++)
            {
                d3.select ('#' + dataIDs[i]).node().innerText = dataValues[i];
            }
        }


        // Range slider CB function 
        d3.select ('input#sliderDate').on ('input', function() 
        {
            // get the value from the slider...
            var index = +d3.select(this).node().value;

            UpdateUI (index);

            currIndex = index;
        });


        d3.select ('#PrevDay').on ('click', function()
        {
            currIndex--;
            if (currIndex < 0)
                currIndex = 0;

            UpdateUI (currIndex);

            d3.select ('input#sliderDate').node().value = currIndex;
        });


        d3.select ('#NextDay').on ('click', function()
        {
            currIndex++;
            if (currIndex == dataset.length)
                currIndex = dataset.length - 1;

            UpdateUI (currIndex);

            d3.select ('input#sliderDate').node().value = currIndex;
        });

    }); // CSV read

}




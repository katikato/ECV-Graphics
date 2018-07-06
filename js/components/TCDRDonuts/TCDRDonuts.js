import tcdrDonutsTmplt from './TCDRDonuts.html!text';

export var TCDRDonuts = Vue.component('tcdr-donuts',  {
    template: tcdrDonutsTmplt,
    data() {
        return {
            ds: [],
            hide: true,
            dataEntries: [],
            instsColScl: {},
            showDonuts: true,
            hasCurrent: false,
            hasFuture: false,
            name: 'donuts'
        }
    },
    methods: {
        render(){
            if (this.dataEntries.length >0){
                renderTCDRDonutGraph(this);
            } else {
                this.showDonuts = false;
            }
        },
        setAll(ob){_(this).extend(ob)},
        reset(){
            this.dataEntries = []
        }
    },
    watch: {
        dataEntries(newValue, oldValue){
            this.render()
        }
    },
    // updated(){
    // }
})



function renderTCDRDonutGraph(donutGraph){
    // console.log('render donuts');
    donutGraph.showDonuts = true;

    var el = donutGraph.$el;
    var eltW = $(donutGraph.$root.$el).width()/3;

    var colScl = donutGraph.colScl;

    var pieSettings = {
        header: {
            title: {
                text: null
            }	
        },
        footer: {
            title: {
                text: null
            }	
        },
        data: {
            sortOrder: 'value-asc',
            content: [],
            smallSegmentGrouping: {
                enabled: false,
                value: 1
            },
        },
        labels: {
            outer: {
                format: "label",
                hideWhenLessThanPercentage: null,
                pieDistance: 30
            },
            inner: {
                format: "percentage",
                hideWhenLessThanPercentage: 3
            },
            mainLabel: {
                color: "#333333",
                font: "Roboto Condensed",
                fontSize: 13
            },
            percentage: {
                color: "#ffffff",
                font: "Roboto Condensed",
                fontSize: 13,
                fontWeight: 600,
                decimalPlaces: 0
            },
            value: {
                color: "#cccc44",
                font: "Roboto Condensed",
                fontSize: 13
            },
            lines: {
                enabled: true,
                style: "curved",
                color: "segment" // "segment" or a hex color
            }
        },
        size: {
            pieInnerRadius: '40%',
            pieOuterRadius: '70%',
            canvasWidth: eltW, 
            canvasHeight: eltW          
        },
        misc: {
            colors: {
                segmentStroke: '#757575'
            }	
        }
        
    };


    var dataEntries = donutGraph.dataEntries;
    var cfx = new crossfilter(dataEntries);

    var byInst = cfx.dimension(d => d.InstAcronym );

    var getPieData = function(d){return {label: d.key, value: d.value, color:  colScl(d.key)}}
    var getPieDataNoLabel = function(d){return {value: d.value, color: colScl(d.key), caption: d.key}}
    
    var dataByInst = byInst.group().all();

    if ( dataByInst.length > 1){  
        donutGraph.hide = false;

        pieSettings.size.pieOuterRadius = "100%";
        pieSettings.labels.lines.enabled = false;
    
        pieSettings.tooltips = {
            enabled: true,
            type: "placeholder",
            string: "{label}, {percentage}%"
        };

        var dataByTime = byInst.group().reduceSum(d => d.TimespanInDays).all()
        pieSettings.data.content = dataByTime.map(getPieData);   

        d3.select('#pie-by-time').html('');
        new d3pie("pie-by-time", pieSettings);

        pieSettings.tooltips = {
            enabled: true,
            type: "caption"
        };

        var ds = donutGraph.ds;
        
        var recordsByStatus = _.groupBy(ds, 'CurrentFuture');
        var currentIDs = recordsByStatus.Current;
        var futureIDs = recordsByStatus.Future;

        
        if (_(recordsByStatus).keys().length != 2){
            donutGraph.hasCurrent = false;
            donutGraph.hasFuture = false; 
        }
        else {
            pieSettings.size.canvasHeight = eltW*0.7;
            pieSettings.size.canvasWidth = eltW*0.7;

            donutGraph.hasCurrent = true;
            donutGraph.hasFuture = true;
                
            currentIDs = currentIDs.map(r => r.RecordID);
            var entriesCurrentByInst = new crossfilter(dataEntries.filter(r => currentIDs.includes(r.RecordID))).dimension(d => d.InstAcronym );
            var currentByInstTime = entriesCurrentByInst.group().reduceSum(d => d.TimespanInDays).all();
    // console.log(currentByInstTime);           
            d3.select('#pie-by-time-current').html('');
            pieSettings.data.content = currentByInstTime.map(getPieDataNoLabel);   
            new d3pie("pie-by-time-current", pieSettings);
        
            futureIDs = futureIDs.map(r => r.RecordID);        
            var entriesFutureByInst = new crossfilter(dataEntries.filter(r => futureIDs.includes(r.RecordID))).dimension(d => d.InstAcronym );
            var futureByInstTime = entriesFutureByInst.group().reduceSum(d => d.TimespanInDays).all();
            d3.select('#pie-by-time-future').html('');
            pieSettings.data.content = futureByInstTime.map(getPieDataNoLabel);
            new d3pie("pie-by-time-future", pieSettings);
            
        }
       
    

    } else { donutGraph.hide = true }
    




    
}   

import 'js/components/Axis/Axis';

import tcdrTimelineTmplt from './TCDRTimeline.html!text';
import randomColors from 'data/randomColors.json!';

var dataEntriesBaseUrl = 'https://oecvinv01.eumetsat.int/ECV_public/?user_key=dfddgrjklerkgbvtr435qgvdcsffsefwer556gfgrt6uijnweefwet523rf%20dfcerg5e462DGFj%C2%A7RFAERGARET34234ds&format=json&page=data_entries&filter[RecordID]=IN_';

export var TimeLineGraph = Vue.component('tcdr-timeline',  {
    template: tcdrTimelineTmplt,
    props: {
        ds: Array
    },
    data: function(){
        return {
            ready: false,
            showDataEntryBars: false,
            showTimeline: true,
            showDonuts: true,
            dataEntries: [],
            renderEntries: false,
            renderRecords: false,
            reInitDropdowns: false,
            scl: {}
        }
    },
    computed: {
        dsSelection(){return (this.ready)? _(this.ds).sortBy('StartDateTCDR') : []},
        dsByProduct(){return d3.nest().key(d => d.ECV_Product).entries(this.dsSelection)} ,
        entriesById(){return _.groupBy(this.dataEntries, 'RecordID')},
        instruments(){return _.keys(_.groupBy(this.dataEntries, 'InstAcronym'));},  
        colScl(){return d3.scaleOrdinal().domain(this.instruments).range(randomColors.colors); } ,
    },
    methods: {
        recordToggleEntries: function(rec){
            this.$set(rec, 'showEntries', _(rec).has('showEntries') ? !rec.showEntries : true)
        },
        getCFColor: function(cf){return this.cfColors[cf] },
        
        updateRecords: function(){ 
            var ECVNames = new crossfilter(this.ds).dimension(d => d.ECVName).group().all();
            this.ready = (ECVNames.length == 1)? true : false;            
            if (this.ready) {
                this.reInitDropdowns = true;
                this.getDataEntries();
            }
        },
        getDataEntries: function(){
            var recIds = this.dsSelection.map(r => r.RecordID);
            
            $.get({
                dataType:"jsonp",
                url: dataEntriesBaseUrl+recIds.join(','),
                success: resp => {
                    this.dataEntries = resp.map((r,i) => _.extendOwn(r, {idx:i}));
                    this.renderEntries = true;
                    this.$bus.$emit('dataEntriesUpdate',{dataEntries: this.dataEntries, colScl: this.colScl, ds:this.dsSelection})
                } 
            })
        },
        render: function(){
            if (this.ready && this.renderRecords){
                renderTCDRTimeRecords(this);
            }
            
            if (this.ready && this.renderEntries){
                renderTCDRTimeEntries(this);                
            }
            this.reInit();

        },
        reInit(){
            if (this.reInitDropdowns){
                $(this.$el).find('.record-dropdown').foundation();  
                this.reInitDropdowns = false;               
            }
        }
    },
    watch: {
        ds: function (newValue, oldValue) {
            if (oldValue && newValue.map(d=>d.RecordID).join() != oldValue.map(d=>d.RecordID).join()){
                this.reInitDropdowns = true;
                this.renderRecords = true;
                this.updateRecords();
            }
        }, 
    },
    updated(){
        this.render();
    }
});



function renderTCDRTimeRecords(timelineGraph){
    timelineGraph.showDataEntryBars = true;
    

    var nrTicks = 8;
    var axisHeight = 30;
    var tp = d3.timeParse("%Y-%m-%d"); 

    var ds = timelineGraph.ds;

    var el = timelineGraph.$el
    
    var data = d3.selectAll('.record[data-holder]').data();
    var vals = _.flatten(ds.map(r => [r.StartDateTCDR, r.EndDateTCDR])).sort();
    
    var t0 = tp(vals.shift());
    var t1 = tp(vals.pop());

    var refElt = $(d3.select(el).select('.record').node());
    var eltW = refElt.width();


    var x = d3.scaleTime().domain([t0, t1]).range([0, eltW]);
    timelineGraph.scl = x;


    var topbars = d3.select(el)
        .selectAll('.top-record.bar-line')
        .each(function(d,i){
            d3.select(this).datum(data[i])
        } );
    topbars
        .style('left', d => x(tp(d.StartDateTCDR))+'px')
        .style('width', d => x(tp(d.EndDateTCDR)) - x(tp(d.StartDateTCDR))+'px' )
        .style('background-color', d => timelineGraph.getCFColor(d.CurrentFuture))

    var topAxis = d3.axisTop(x).ticks(nrTicks);  
    var axTopElt = $(timelineGraph.$el).find('.top-axis')[0];      
    d3.select(axTopElt)
        .html('')
        .style('height', axisHeight+'px')
        .append("svg")
        .attr("width", eltW)
        .attr("height",axisHeight)
        .append("g")
        .attr('transform', `translate(0, ${axisHeight})`)
        .call(topAxis); 
    var btmAxis = d3.axisBottom(x).ticks(nrTicks);  
    var axBtmElt = $(timelineGraph.$el).find('.bottom-axis')[0];      
    d3.select(axBtmElt)
        .html('')
        .append("svg")
        .attr("width", eltW)
        .attr("height",axisHeight)
        .append("g")
        .call(btmAxis); 
    
    timelineGraph.renderRecords = false;
}


function renderTCDRTimeEntries(timelineGraph){
    var el = timelineGraph.$el;        
    var instruments =  timelineGraph.instruments;
    var colScl = timelineGraph.colScl;
    var x = timelineGraph.scl; 
    var tp = d3.timeParse("%Y-%m-%d"); 
    
    d3.select(el).selectAll('.entry-line')
        .style('left', d => x(tp(d.DataStartDate))+'px')
        .style('width', d => x(tp(d.DataEndDate)) - x(tp(d.DataStartDate))+'px' )
        .style('border-bottom-color', d => chroma.hex(colScl(d.InstAcronym)).alpha(1).css()) 
    
    d3.select(el).selectAll('.indicator-line')
        .style('left', d => x(tp(d.DataStartDate))+'px')
        .style('width', d => x(tp(d.DataEndDate)) - x(tp(d.DataStartDate))+'px' )
        .style('background-color', d => chroma.hex(colScl(d.InstAcronym)).alpha(0.4).css()) 


    timelineGraph.showDataEntryBars = false;
    timelineGraph.renderEntries = false;    
}
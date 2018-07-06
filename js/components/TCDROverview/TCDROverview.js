// import '/js/components/commonPlugin';
import 'js/components/Axis/Axis';

import tcdrOverviewTmplt from './TCDROverview.html!text';


export var TCDROverview = Vue.component('tcdr-overview',  {
    template: tcdrOverviewTmplt,  
    props: {
        ds: Array
    },
    methods: {
        getDataRange(){ 
            var vals = d3.select(el).selectAll('.bar-line').data().map(r => r.values.length);            
            return [0, d3.max(vals)] },
        sortByKey : function(arr){return _.sortBy(arr, r => r.key);} ,
        nestBy: function(key, recs){return d3.nest().key(d => d[key]).entries(recs);},
        select: function(sel){ this.$bus.$emit('addToSelection', sel);},
        resetOptions: function(sel){ this.$bus.$emit('resetOptions');},     
        render: function(){renderTCDROverviewGraph(this);}
    },
    updated: function(){this.render()}
})

function renderTCDROverviewGraph(overviewGraph){
    var el = overviewGraph.$el;
    var bh = 10;
    var gap = 1;
    var nrTicks = 5;
    var axisHeight = 30;

    var vals = d3.select(el).selectAll('.bar-line').data().map(r => r.values.length);
    
    var refElt = $(d3.select(el).select('.graph-display').node());
    var eltW = refElt.width();
    
    var x = d3.scaleLinear().domain([0, d3.max(vals)]).range([0, eltW]);
    
    d3.select(el).selectAll('.bar-line')
        .style('width', d => x(d.values.length)+'px' )
        .style('height', bh)
        .style('background-color', d => overviewGraph.cfColors[d.key])
        .style('margin-bottom', gap);

    d3.select(el).selectAll('.bar-label')   
        .html(d => `<b>${d.values.length}</b> ${d.key} TCDRs`);

    overviewGraph.$refs.topaxis.setRefElt(refElt).setScl(x).render();
    overviewGraph.$refs.bottomaxis.setRefElt(refElt).setScl(x).render();

}


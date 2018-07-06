// import '/js/components/commonPlugin.js';


var axisMx = {
    props: {
        nrTicks: { default:()=>5 }
    },
    data() {
        return {
            scl: undefined,
            refElt: undefined            
        }
    },
    methods:{
        setScl(scl){ this.scl = scl; return this},
        setRefElt(elt){ this.refElt = elt; return this}
    }
};

export var XAxis = Vue.component('x-axis',  {
    template: '<div class="axis">rendered axis</div>',          
    mixins: [axisMx], 
    props: {
        height: { default:()=>30 } ,
        orientation: { default:()=>'top' } 
    },
    data: function(){
        return {
            name: 'x-axis',
        }
    },
    computed: {
        isTopOriented: function(){return (this.orientation == 'top')}
    },
    methods: {    
        render: function(){ 

            var el = d3.select(this.$el);
            var ax = this.isTopOriented ? d3.axisTop(this.scl) : d3.axisBottom(this.scl);
            ax.ticks(this.nrTicks);

            el
                .html('')
                .style('left', this.refElt.position().left + 'px')
                .style('width', this.refElt.width()+'px')
                .style('height', this.height+'px' )
                .append('svg')
                .attr('width', this.refElt.width())
                .attr('height', this.height)
                .append('g')
                .attr('transform', `translate(0, ${this.isTopOriented ? this.height : 0})`)
                .call(ax); 
        }
    },
    beforeCreated: function(){
        this.height = 30;
        this.orientation = 'top';
    }   
})
    


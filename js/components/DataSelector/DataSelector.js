import selectorTmpl from './DataSelector.html!text';

function  getLutVal(lut, val){
    return _(lut).find(d => 
        d.val.replace(/\s/g,'') == val.replace(/\s/g,'')
    ).LUT_val
}

export var DataSelector = Vue.component('data-selector',  {
    template: selectorTmpl,
    data: function(){
        return {
            data: [],
            cf: {},
            selectorFields: d3.map(),
            selection: [],
            name: 'data selector'
        }
    },
    computed: {
        activeRecords: function(){
            this.selectorFields.values().forEach(r => r.dim.filterAll());
            this.selection.map(r => {
                var vals = r.sel.map(s => s.key);
                var fn = function(d){return vals.includes(d)}

                this.selectorFields.get(r.colID).dim.filterFunction(fn);
            })
            return (this.dataIdx) ? this.dataIdx.top(Infinity) : [];  
        }
    },
    methods: {
        nrRecords(){return _.isEmpty(this.cf) ? 0: this.cf.groupAll().value();},        
        reset(){
            this.data = [],
            this.selectorFields = d3.map()
        },
        create(data, fields){
            this.reset();
            this.createDataIdx(data);
            this.addFields(fields);
        },
        createDataIdx(data){
            this.data = data.map((r,i) => _.extendOwn(r, {idx:i}));
            this.cf = crossfilter(this.data);        
            this.dataIdx = this.cf.dimension(d => d.idx);
        },
        addFields(fields){       
            fields
                .filter(fld => (fld.isSelector==false) ? false: true)
                .map(fld => {
                    if (_(fld).has('ref') && _(fld).has('useLut')){
                        let lut = fld.useLut;
                        let refFld = fld.ref;
                        let newColumn = fld.colID;
                        this.data = this.data.map(r => {
                            r[newColumn] = getLutVal(lut, r[refFld]);
                            return r
                        })
                    }
                    fld.dim = this.cf.dimension(d => d[fld.colID]);
                    fld.options = fld.dim.group().all();
                    fld.options.map(opt => _.extendOwn(opt, {checked: false}));
   
                    this.selectorFields.set(fld.colID, fld);
                });                
            this.updateSelection();
        },
        broadCastRecordUpdate(){this.$bus.$emit('activeRecordsUpdate', this.activeRecords); },
        optionChange: function(){
            this.updateSelection(); 
        },
        updateSelection(){
            this.selection = this.selectorFields.entries()
                .map(r => {return {colID: r.key, sel:r.value.options.filter(opt => opt.checked)}})
                .filter(r => r.sel.length > 0);

            this.broadCastRecordUpdate();            
        },
        addToSelection(sel){
            var fields = this.selectorFields;
            d3.map(sel).entries().map(d => {
                fields.get(d.key).options.filter(opt => opt.key == d.value)[0].checked = true;        
            })
            this.updateSelection();
        },
        clearOption: function(fld, opt){
            this.selectorFields.get(fld).options.find(r => r.key == opt).checked = false;
            this.updateSelection();
        },
        resetOptions: function(){
            this.$bus.$emit('clearSelection'),     
            this.selectorFields.values().map(fld => fld.options.map(opt => opt.checked = false));
            this.updateSelection();
        },
    },
    mounted(){
        $(this.$el).foundation();
    },
    updated(){
        Foundation.reInit('dropdown-menu');        
    }
})


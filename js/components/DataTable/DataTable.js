import dataTableTmpl from './DataTable.html!text';

export var DataTable = Vue.component('data-table',  {
    template: dataTableTmpl,
    props: {
        activeRecords: {type:Array, default:()=>[]},
        csvFilename: String
    },
    data: function(){
        return {
            colFields: d3.map(),
            tbl: {},
            name: 'data table'          
        }
    },
    methods: {
        addFields: function(fields){               
            fields
            .filter(fld => !fld.hide)
            .map(fld => {
                this.colFields.set(fld.colID, fld);
            }); 
            d3.select(this.$el)
                .select('table thead tr')
                .selectAll('th')
                .data(this.colFields.values())
                .enter()
                .append('th')
                .attr('data-dynatable-column', fld => fld.colID)
                .html(fld => fld.label ? fld.label: fld.colID);
            this.createTable();            
            this.showComponent();
        },
        createTable: function(){
            var comp = this; 
            
            this.tbl = $(this.$el).find('.table-view table')
                .dynatable({
                    features: {
                        paginate: true,
                        sort: true,
                        pushState: true,
                        search: true,
                        recordCount: true,
                        perPageSelect: true
                    },
                    inputs: {
                        paginationPrev: '<',
                        paginationNext: '>',
                        perPageOptions: [5,10,20,50,100],
                        paginationGap: [1,2,2,1]                    
                    },
                    dataset: {
                        records: []
                    },
                    writers: {
                        _rowWriter: function(idx, rec, cols, cellW){
                            var res = cols.map(col => cellW(col, rec));
                            return `<tr data-selector-idx=${rec.RecordID}>${res.join('')}</tr>`;
                        }
                    }
                })
                .data('dynatable'); 

                comp.tbl.$element.find('tbody').on('click', 'tr', function(e){   
                    comp.broadcastRecordDetails($(this).attr('data-selector-idx'), e.pageY);
                }); 
        },
        broadcastRecordDetails: function(idx, ypos){            
            var rec = _.findWhere(this.tbl.settings.dataset.originalRecords,{RecordID: idx}); 
            this.$bus.$emit('recordDetails', rec, ypos );            
        },
        updateActiveRecords: function(){
            if (this.activeRecords.length > 0 && ! _.isUndefined(this.tbl.settings.dataset.records)){

                this.tbl.settings.dataset.originalRecords = this.activeRecords;
                this.tbl.paginationPage.set(1); // Go to page 5
                this.tbl.process(); 
            }
        },
        downloadCSV: function(partial){
            this.$bus.$emit('downloadCSV', partial, this.csvFilename);
        }       
    },
    updated(){
        this.updateActiveRecords();
    }
    
});


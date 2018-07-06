// SET YOUR API KEY HERE //
// GET API ACCESS via ecv_inventory@eumetsat.int or via the website http://climatemonitoring.info
const ApiEcvDb = 'XXXXXXXXXX'

// import Vue components
import 'js/components/DataSelector/DataSelector';
import 'js/components/DataTable/DataTable';
import 'js/components/TCDROverview/TCDROverview';
import 'js/components/TCDRTimeline/TCDRTimeline';
import 'js/components/TCDRDonuts/TCDRDonuts';

// component Vue component templates
import recordDetailsTmplt from './recordDetails.html!text';
import ecvDashboardTmplt from './EcvDashboard.html!text';

// export label settings for exporting ECV database
import exportLabels from 'data/exportLabels.json!';


// Lookuptable for database 'organisation' label conversion & grouping
import orgLut from 'data/orgLut.tsv!tsv'

// ECV Database connection  base url's
var ecvRecordsUrl = 'https://oecvinv01.eumetsat.int/ECV_public/?format=json&page=approved_records&user_key=' + ApiEcvDb ;
var ecvRecordDetailsCurrent = 'https://oecvinv01.eumetsat.int/ECV_public/?user_key=' + ApiEcvDb + '&format=json&page=ECV_items_Current&filter[RecordID]=IN_'
var ecvRecordDetailsFuture = 'https://oecvinv01.eumetsat.int/ECV_public/?user_key=' + ApiEcvDb + '&format=json&page=ECV_items_Future&filter[RecordID]=IN_'

// URL for full data export to CSV
var csvUrl = 'https://oecvinv01.eumetsat.int/ECV_public/?user_key=' + ApiEcvDb + '&page=for_export&format=csv';

// ECV table fields settings for data from database
var tblFields = [  
    {colID: 'RecordID', label:'ID', isSelector: false},  
    {colID: 'Domain', label:'Domain'},
    {colID: 'ECVName', label:'ECV'},
    {colID: 'ECVProduct', label:'Product'},
    {colID: 'PhysQuantity', label:'Physical Quantity', isSelector:false},
    {colID: 'CurrentFuture', label:'Status'},
    {colID: 'ResponsibleOrg', label:'Org', isSelector:false},
    {colID: 'StartDateTCDR', label: 'From', isSelector:false} ,    
    {colID: 'EndDateTCDR', label: 'To', isSelector:false},
    {colID: 'shortOrg', label:'Org', isSelector: true, ref: 'ResponsibleOrg', useLut: orgLut, hide: true}
];

// Convert plain text from database record details to html links (if any)
function createLinks(txt){
    let xp =/((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~(_|])/gi
    
    if (_.isString(txt)){
        return txt.replace(xp, "<br><a target='_blank' href='$1'>$1</a>")        
    }
}
        


// Component definition for record details overlay
Vue.component('data-table-record-details',  {
    template: recordDetailsTmplt,
    data: function(){
        return {
            name: 'data-table-records',
            details: {},
            isCurrent: true,
            reveal: {},
            tabs: {},
        }
    },
    methods: {
        update: function(rec) {
            this.isCurrent = rec.CurrentFuture == 'Current';
            this.isActive = true;
            let detailsUrl = this.isCurrent ? ecvRecordDetailsCurrent : ecvRecordDetailsFuture;
            $.get({
                dataType: "jsonp",
                url: detailsUrl+rec.RecordID,
                success: resp => {
                    let details = resp[0]
                    _.map(details, (v,k) => {
                        details[k] = _.isString(v) ? createLinks(v): v
                    })
                    this.$set(this, 'details', details)
                    this.tabs.selectTab('#ECV_items_Current_list_tab_data_0');
                    this.reveal.open(); 

                }       
            }); 
        }
    },
    mounted(){
        this.reveal = new Foundation.Reveal($("#recordDetails"));
        this.tabs = new Foundation.Tabs($('#record-detail-tabs'))      
    }

});



export var EcvDashboard =  Vue.component('ecv-dashboard', {
    template: ecvDashboardTmplt,
    data(){
        return {
            activeRecords: [],
            name: 'my dashboard',
            dataLoadError: false
        }
    },
    computed: {
        hasRecords: function(){return this.activeRecords.length>0 }
    },
    methods: {
        updateActiveRecords: function(activeRecords){this.activeRecords = activeRecords;}
    },

    mounted() {
        initDashboard(this);       
    }

});

function initDashboard(myDashboard){
    var mySelector = myDashboard.$refs.ecvselector; 
    var myEcvtable = myDashboard.$refs.ecvtable; 
    var myDetails = myDashboard.$refs.ecvrecorddetails;
    var myDonuts = myDashboard.$refs.tcdrdonuts;


    myEcvtable.addFields(tblFields);
    
    
    myDashboard.$bus.$on('activeRecordsUpdate', function(ar){
        myDashboard.updateActiveRecords(ar);
    });


    mySelector.$bus.$on('addToSelection', function(sel){
        mySelector.addToSelection(sel);
    })
    mySelector.$bus.$on('resetOptions', function(){
        mySelector.resetOptions();
    })
    
    myDetails.$bus.$on('recordDetails', function(rec, ypos){
        myDetails.update(rec);    
    });
 
    myEcvtable.$bus.$on('downloadCSV', function(partial, filename){
        var recordFilterUrlExt = '&filter[RecordID]=IN_';
        var recIDFilter = (partial) ? recordFilterUrlExt+myDashboard.activeRecords.map(r => r.RecordID).join(',') : '';
        var csvUrl = csvUrl + recIDFilter +'&filename='+ filename;
        var link = document.createElement("a");
        link.setAttribute("href", csvUrl);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
    });
    

    myDonuts.$bus.$on('dataEntriesUpdate', function(ob){
        myDonuts.setAll(ob);
    }) 
 
    myDonuts.$bus.$on('clearSelection', function(){
        myDonuts.reset();
    })    
 
            

    $.get({
        dataType:"jsonp",
        url: ecvRecordsUrl,
        success: resp => mySelector.create(resp, tblFields),
        error: err => myDashboard.dataLoadError = true       
    });


}
    
   


    
    

        

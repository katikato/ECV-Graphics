console.log('ECV graphics demo')
import './commonImports';
import  './components/EcvDashboard/EcvDashboard';

$(document).foundation();

Vue.config.debug = true; 
Vue.config.devtools = true;

Vue.use(VueBus);
Vue.use(WGClimatePlugin);


var mycomp = new Vue({
    el: '#main-page',
    created(){
        console.log('vue ready');        
    }
});







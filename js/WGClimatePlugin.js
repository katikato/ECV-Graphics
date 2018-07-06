// This is your plugin object. It can be exported to be used anywhere.
const WGClimatePlugin = {
    install(Vue, options) {
        Vue.prototype.cfColors = {Current: '#8BC34A', Future: '#FFEB3B'};
        
        Vue.directive('d3-data', function (el, binding) {
            d3.select(el).datum( binding.value);
        });

        Vue.mixin({
            data(){return {
                name: 'noname',
                hide: true
            }},
            methods: {
                setElementOptions(){
                    d3.map(this.elementOptions).entries().map(opt => this[opt.key] = opt.value);
                },
                toggleVisibility: function(){this.hide = !this.hide},
                showComponent: function(){this.hide = false},
                hideComponent: function(){this.hide = true},
                eltWidth: function(){return $(this.$el).width()},
                eltHeight:  function(){return $(this.$el).height()},
                stripNonLetters: function(s){return s.replace(/\W/g, '');},
                sortBy : function(arr, key){return _.sortBy(arr,key);}                
            },
            mounted() {
                if (this.parentId && $('#'+this.parentId).length>0){
                    var parent = $('#'+this.parentId);
                    parent.append(this.$el);
                }
            }
        });
    }
  };

  
  export default WGClimatePlugin;
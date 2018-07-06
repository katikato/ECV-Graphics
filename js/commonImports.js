import 'babel/polyfill';
import $ from 'jquery';
import 'foundation-sites';
import Vue from 'vue/dist/vue';
import VueBus from 'vue-bus';
import WGClimatePlugin from 'js/components/WGClimatePlugin';

import _ from 'underscore';
import moment from 'moment';

import 'alfajango/jquery-dynatable';
import crossfilter from 'crossfilter';

import * as d3 from 'd3/build/d3';
import chroma from 'gka/chroma.js';

import Handlebars from 'github:components/handlebars.js@4.0.11/handlebars';

import dc from 'dc';
import d3pie from 'benkeen/d3pie';

_.templateSettings = {
    interpolate: /\[\[(.+?)\]\]/g
  };
  
function parseBoolean(string) {
    var bool;
    bool = (function() {
      switch (false) {
        case string.toLowerCase() !== 'true':
          return true;
        case string.toLowerCase() !== 'false':
          return false;
      }
    })();
    if (typeof bool === "boolean") {
      return bool;
    }
    return void 0;
};


(function(global) {
    global.$ = $;
    global._ = _;
    global.Vue = Vue;
    global.moment = moment;
    global.d3 = d3;
    global.chroma = chroma;
    global.crossfilter = crossfilter;
    global.Handlebars = Handlebars;
    global.d3pie = d3pie;

    global.parseBoolean = parseBoolean;
    
    global.VueBus = VueBus;
    global.WGClimatePlugin = WGClimatePlugin;
     

})(typeof self != 'undefined' ? self : global);
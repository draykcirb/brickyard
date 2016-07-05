/**
 * Created by Scott on 2015/7/22.
 */
'use strict';

var _ = require('lodash')
var angular = require('angular')

angular.module('business', [
		'fa.directive.borderLayout',
		'business.widgets',
		'business.common',
		'business.realtime',
		'business.track',
		'business.notificationQuery'
	])


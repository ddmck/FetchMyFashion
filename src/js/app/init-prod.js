var app = angular.module('App', ['infinite-scroll', 'ngSanitize', 'btford.markdown', 'ui.router', 'ng-token-auth', 'ipCookie', 'ngStorage', 'angularPayments', 'btford.modal', 'akoenig.deckgrid', 'selectize']);
var backendUrl = "https://www.shopshopgo.com/";
var assetsUrl = 'https://s3-eu-west-1.amazonaws.com/fetchmyfashion/';
var scraperUrl = 'http://46.101.56.191:5000/';
Stripe.setPublishableKey('pk_live_j9uqoLXHPhq1clGi5jDnIWpy');

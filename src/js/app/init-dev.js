var app = angular.module('App', ['infinite-scroll', 'ngSanitize', 'btford.markdown', 'ui.router', 'ng-token-auth', 'ipCookie', 'ngStorage', 'angularPayments', 'btford.modal', 'akoenig.deckgrid', 'selectize']);
var backendUrl = "http://localhost:3000/";
var assetsUrl = 'http://localhost:9000/';
var backendUrl = 'http://localhost:3000/';
var scraperUrl = 'http://localhost:5000/';
Stripe.setPublishableKey('pk_test_mfQJDA4oT57DLFi7l0HYu782');
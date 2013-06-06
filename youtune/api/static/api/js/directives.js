app = angular.module('youtune');

var username_regexp = /^[\w]+$/;
app.directive('username', function (){ 
    return {
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {

            //For DOM -> model validation
            ctrl.$parsers.unshift(function(value) {
                var valid = username_regexp.test(value);
                ctrl.$setValidity('username', valid);
                scope.dupename = false;
                return valid ? value : undefined;
            });
            
            //For model -> DOM validation
            ctrl.$formatters.unshift(function(value) {
            	ctrl.$setValidity('username', username_regexp.test(value));
                return value;
            });   
            
        }
    };
});

app.directive("repeatPassword", function() {
    return {
        require: "ngModel",
        link: function(scope, elem, attrs, ctrl) {
            var otherInput = elem.inheritedData("$formController")[attrs.repeatPassword];

            ctrl.$parsers.push(function(value) {
                if(value === otherInput.$viewValue) {
                    ctrl.$setValidity("repeat", true);
                    return value;
                }
                ctrl.$setValidity("repeat", false);
            });

            otherInput.$parsers.push(function(value) {
                ctrl.$setValidity("repeat", value === ctrl.$viewValue);
                return value;
            });
        }
    };
});

var FLOAT_REGEXP = /^\-?\d+((\.|\,)\d+)?$/;
app.directive('smartFloat', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if (FLOAT_REGEXP.test(viewValue)) {
          if (parseFloat(viewValue.replace(',', '.')) > 1 || parseFloat(viewValue.replace(',', '.')) < 0 )
          {
            ctrl.$setValidity('float', false);
            return undefined;
          }
          else
          {
            ctrl.$setValidity('float', true);
            return parseFloat(viewValue.replace(',', '.'));
          }
        } else {
          ctrl.$setValidity('float', false);
          return undefined;
        }
      });
    }
  };
});
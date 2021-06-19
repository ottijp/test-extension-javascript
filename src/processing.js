var MyExtensionJavaScriptClass = function() {};

MyExtensionJavaScriptClass.prototype = {
  run: function(arguments) {
    arguments.completionFunction({
      "baseURI": document.baseURI,
      "title": document.title
    });
  },

  finalize: function(arguments) {
  }
};

var ExtensionPreprocessingJS = new MyExtensionJavaScriptClass;

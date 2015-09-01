import HandlerInfo from '../handler-info';
import { config } from '../config';
import { subclass, promiseLabel } from '../utils';

var ResolvedHandlerInfo = subclass(HandlerInfo, {
  resolve: function(shouldContinue, payload) {
    // A ResolvedHandlerInfo just resolved with itself.
    if (payload && payload.resolvedModels) {
      payload.resolvedModels[this.name] = this.context;
    }
    return config.Promise.resolve(this, this.promiseLabel("Resolve"));
  },

  getUnresolved: function() {
    return this.factory('param', {
      name: this.name,
      handler: this.handler,
      params: this.params
    });
  },

  isResolved: true
});

export default ResolvedHandlerInfo;


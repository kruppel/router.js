var config = {
  Promise: (typeof global === 'undefined' ? window : global)['Promise']
};

function configure(name, value) {
  config[name] = value;
}

export {
  config,
  configure
};

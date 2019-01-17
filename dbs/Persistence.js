class Persistence {
  constructor () {
    this.crudservice;
    this.metricservice;
  }
  setMetricService(metricservice) {
    this.metricservice = metricservice;
  }

  setCrudService(crudService) {
    this.crudService = crudService;
  }

  getMetricService() {
    return this.metricservice;
  }

  getCrudService() {
    return this.crudService;
  }
}

module.exports = Persistence;

const ProductionPlan = require('./backend/models/ProductionPlan');  
ProductionPlan.findById(process.argv[2]).then(plan =, null, 2))).catch(err =

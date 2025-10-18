import mongoose  from "mongoose";

const scenarioschema= new mongoose.Schema({

   mineid:{
      type:mongoose.Schema.Types.ObjectId,
ref:"mine",
required:true,
   },

     dieselreduction:{
        type:Number,
        required :true,
     },
     methanecapture:{
        type:Number,
        required:true,
     },
     renewableenergyusage:{
        type:Number,
        required:true,
     },
     additionalafforestation:{
        type:Number,
        required:true,
     },
     evadoption:{
        type:Number,
        required:true,
     }
});

const scenario=mongoose.models.scenarioform|| mongoose.model("scenarioform",scenarioschema);
export default scenario;
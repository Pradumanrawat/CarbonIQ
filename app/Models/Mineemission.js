import  mongoose from 'mongoose';

const mineschema= new  mongoose.Schema({
     minetype:{
        type:String,
        enum:["opencast","underground"],
        required:true,

    },

    dieselconsumption:{
        type:Number,
        required:true,
    },
    electricityusage:{
        type:Number,
        required:true,
    },
    vehiclemovement:{
        type:Number,
        required:true
    },
    coalproduction:{
        type:Number,
        required:true,
    },
    methanerelease:{
       type:Number,
       required:true,
    },
    totalworkers:{
        type:Number,
        required:true,
        min:1,
    },
   
   carbonsinks:[{
       sinktype:{
        type:String,
        enum:["Afforestation","Rehabilitation","Soilcarbon"],
        required:true,
       },
       vegetationtype:{
        type:String,
        validate: {
          validator: function(value) {
            if (this.sinktype === "Afforestation" || this.sinktype === "Rehabilitation") {
              return value != null && value !== '';
            }
            return true;
          },
          message: 'Vegetation type is required for Afforestation or Rehabilitation'
        }
       },
       sequestrationrate:{
        type:Number,
        validate: {
          validator: function(value) {
            if (this.sinktype === "Afforestation" || this.sinktype === "Rehabilitation") {
              return value != null && value > 0;
            }
            return true;
          },
          message: 'Sequestration rate is required and must be positive for Afforestation or Rehabilitation'
        },
        min:0,
       },
       area:{
        type:Number,
        required:true,
       },
       soiltype:{
        type:String,
        validate: {
          validator: function(value) {
            if (this.sinktype === "Soilcarbon") {
              return value != null && value !== '';
            }
            return true;
          },
          message: 'Soil type is required for Soilcarbon'
        }
       },
       soilmanagementpractices:{
        type:String,
        validate: {
          validator: function(value) {
            if (this.sinktype === "Soilcarbon") {
              return value != null && value !== '' && ["Notillfarming","Covercropping","organicamendments","Mulching","Agroforestry","Contourfarming"].includes(value);
            }
            return true;
          },
          message: 'Soil management practices is required and must be a valid enum value for Soilcarbon'
        }
       }
   }],
   totalemission:{
    type:Number,
    
   },
   netemission:{
    type:Number,
   }

    
})

const minemanager=mongoose.models.mine || mongoose.model("mine",mineschema);
export default minemanager;




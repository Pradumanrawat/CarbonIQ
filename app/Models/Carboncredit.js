    import mongoose from "mongoose";

    const carboncreditcalculator= new mongoose.Schema({
          mineid:{
              type:mongoose.Schema.Types.ObjectId,
        ref:"mine",
        required:true,
           },

           netemission:{
            type:Number,
        
           },
           carbonprice:{
            type:Number,
            required:true
           },
           baselineemission:{
            type:Number,
           }
           
    })

    const carboncredit=mongoose.models.credit || mongoose.model("credit",carboncreditcalculator);
    export default carboncredit;
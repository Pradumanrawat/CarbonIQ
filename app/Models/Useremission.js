import mongoose from "mongoose";
const genraluserschema=new mongoose.Schema({
       totaldistance:{
        type:Number,
        required: true,
       },

       vehicletype:{
        type: String,
        enum:["carpetrol","cardiesel","bikepetrol","bus","ev"],
        required: true,
       },
       electricityusage:{
        type:Number,

        default:function(){
   if(this.householdmembers<=2) return 150;
    if(this.householdmembers<=4)   return 300;
    return 500;
        }
       },
       householdmembers:{
        type:Number,
        required:true
       },
       renewableusage:{
        type:Number,
        default:0,
       }
});
const GeneralUser = mongoose.models.generaluser || mongoose.model("generaluser", genraluserschema);
export default GeneralUser;

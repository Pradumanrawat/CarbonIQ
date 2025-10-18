

import connectdb from '@/app/config/db';
import generaluser from '../../Models/Useremission';
import {fuelefficiencylookup} from '../../utils/fuelefficiency'

export   async function POST(req,res){
    await connectdb();
   try{
    const { totaldistance,vehicletype,electricityusage,householdmembers,renewableusage}= await req.json();
     const vehicledata= fuelefficiencylookup[vehicletype];

     if(!vehicledata){
        return new Response(JSON.stringify({error:"invalid vehicle type"}))
     }

     //transport emission
     let totaltransportemission=0;
     if(vehicletype==="ev"){
        totaltransportemission=totaldistance*vehicledata.EmissionPerkm;
     }
     else{
        totaltransportemission=totaldistance* vehicledata.EmissionPerLiter/vehicledata.fuelefficiency;
     }


     const user=await generaluser.create({
         totaldistance,
         vehicletype,
         householdmembers,
         electricityusage,
         renewableusage:renewableusage||0,
     })

     const totalelectricityemission=user.electricityusage*0.8;
     const renewablereduction=(user.renewableusage||0)*0.8;
     const totalemission=totaltransportemission+totalelectricityemission-renewablereduction;
     const percaptaemission=totalemission/user.householdmembers
       let status={transport:"", electricity: "" , renewable: ""};
    
       //transport emission advice
       if(vehicletype==="ev") status.transport="Keep using EV or public transport";
else if(vehicletype==="bus") status.transport="Transport emission is moderate.Consider using Ev";
else if(vehicletype==="carpetrol"||vehicletype==="cardiesel")  status.transport="transport emission is  high .Consider public transport or carpooling";
else{
    status.transport="Transport emission is high. consider switching to ev or public transport"
}


//electricity adivice
if (totalelectricityemission <= 200) status.electricity = "Electricity usage is good.";
    else if (totalelectricityemission <= 400) status.electricity = "Electricity usage is moderate. Save energy where possible.";
    else status.electricity = "Electricity usage is high. Reduce electricity consumption.";


//renwable advice

    if ((user.renewableusage || 0) >= 60) status.renewable = "Good renewable usage!";
    else status.renewable = "Consider increasing renewable energy usage.";

     return new Response(JSON.stringify({
          message:"Emission calculated successfully",
          totalemission,
          totalelectricityemission,
          totaltransportemission,
          percaptaemission,
          status

     }),{status:200});

   }
   catch(err){
    console.log(err);
    return new Response(JSON.stringify({error:"internal server error "}))

   }

}
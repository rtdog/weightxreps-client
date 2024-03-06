import { useReactiveVar } from "@apollo/client"
import { $OnStatsResponse } from "../pages/CommunityStats"
import { SoftBox } from "./SoftBox"
import { Grid, LinearProgress, Typography, makeStyles } from "@material-ui/core";
import { useMemo } from "react";
import WeightValue from "./weight-value";
import { useGetSession } from "../session/session-handler";

const useStyles = makeStyles(theme=>({
    box: {
        border:"2px solid black",
        background:"white",
        color:"#444",
        fontSize:"1.1em",
        padding:6,
        borderRadius:8,
        marginBottom:15,
        "& > div": {
            overflow:"hidden",
            borderBottom:"1px dotted #333",
            
            "& > div:first-child": {
                float:"right"
            },
            "& > div:last-child": {
                fontWeight:"bold"
            },
            "&.big": {
                borderBottomStyle:"solid",
                borderBottomWidth:3,
                fontSize:"1.3em",
                color:"black"
            },
            "&.small": {
                paddingLeft:20,
                fontStyle:"italic",
                "& > div:last-child": {
                    fontWeight:"normal"
                },
            }
        }
    },
    rank: {
        background: theme.palette.secondary.main,
        color:theme.palette.secondary.contrastText,
        padding:2,
        display:"inline-block",
        borderRadius:30,
        fontWeight:"bold",
        fontFamily:"monospaced"
    },
    rank1: {
        backgroundColor:"#D2AE36 !important"
    },
    rank2: {
        backgroundColor:"#ccc !important"
    },
    rank3: {
        backgroundColor:"#B77231 !important"
    }
}));



/**
 * Depends on data loaded and generated by the community stats page.
 */
export default function CommunityStatsSoftBox({ match:{  path, url, params:{ filtermask } } }) {

    /**
     * @type {import("../data/generated---db-types-and-hooks").GetCommunityStatsQuery}
     */
    const data = useReactiveVar($OnStatsResponse);
    const classes = useStyles();
    const user = useGetSession();

    const facts = useMemo(()=>{

        const d = data?.communityStats;

        if(!d?.users?.length) return false;

        const inKg = user.session?.user.usekg ?? 1;

        let arr = [
            { lbl:"Total users", val:d.users.length, big:true },
            // { lbl:"Heavyest", val:<WeightValue value={d.heavyest[0].w.v} inkg={ inKg }/> },
            // { lbl:"Average*", small:true, val:<WeightValue prefix="~" round value={ calculateAverage( d.heavyest.map(h=>h.w.v) ) } inkg={ inKg }/> },
            // { lbl:"Max Volume", val:<WeightValue value={d.heavyest[0].w.v} inkg={ inKg }/> },
        ];

        ["Males","Females"].forEach( (g,i) => {

            const users = d.users.filter(u=>u.isf==i); 
 
            if( users.length==0) return;

            arr.push({ lbl:g, big:true, val: `${users.length} (${ Math.round((users.length/d.users.length)*100)}%)` });

            const heavyest = d.heavyest.filter(h=>h.by.isf==i );
            const volume = d.volume.filter(h=>h.by.isf==i );

            arr.push({ lbl:"Heavyest", val:<WeightValue value={heavyest[0].w.v} inkg={ inKg }/> });
            arr.push({ lbl:"Average*", small:true, val:<WeightValue prefix="~" round value={ calculateAverage( heavyest.map(h=>h.w.v) ) } inkg={ inKg }/> });
            arr.push({ lbl:"Max Volume", val:<WeightValue value={volume[0].w.v} inkg={ inKg }/> });
            arr.push({ lbl:"Average*", small:true, val: <WeightValue round prefix="~" value={calculateAverage( volume.map(h=>h.w.v) )} inkg={ inKg }/> });

        });

        if( user.session )
        {
            // max
            const me =user.session.user; //  d.users[1]; //
            const hasData = d.users.find(u=>u.id==me.id) != null; 

            if( hasData )
            {
                arr.push({ lbl:"You", big:true, val:hasData? "#rank**" : <i>-- not listed --</i> });

                const heavyest      = d.heavyest.filter(h=>h.by.isf==me.isf ); 
                const estimated     = d.estimated.filter(h=>h.by.isf==me.isf ); 
                const volume        = d.volume.filter(h=>h.by.isf==me.isf ); 

                const myHeavyest    = heavyest.findIndex( h=>h.by.id==me.id );
                const myEstimated   = estimated.findIndex( h=>h.by.id==me.id );
                const myVolume      = volume.findIndex( h=>h.by.id==me.id );
                
                if(myHeavyest>-1)
                    arr.push({ lbl:"Heavyest", val:<><WeightValue value={heavyest[myHeavyest].w.v} inkg={ heavyest[myHeavyest].w.lb==0 }/> <Rank value={myHeavyest}/></> });

                if(myEstimated>-1)
                    arr.push({ lbl:"Best ~1RM", val:<><WeightValue prefix="~" round value={Math.round(estimated[myEstimated].w.v)} inkg={estimated[myEstimated].w.lb==0 }/> <Rank value={myEstimated}/></> });

                if(myVolume>-1)
                    arr.push({ lbl:"Volume", val:<><WeightValue value={volume[myVolume].w.v} inkg={ volume[myVolume].w.lb==0 }/> <Rank value={myVolume}/> </> });   
            }
            

            //max est
            //volume
        }

        return arr;

    }, [ data?.communityStats, user.session ])
 
    return <SoftBox title="Overview">
        {!data && <LinearProgress/>}
        {facts && <> <div className={classes.box}>
            
            { facts.map(fact=>(<div className={ fact.big? "big" : fact.small?"small" : ""}>
                                    <div>{fact.val}</div> 
                                    <div>{fact.lbl}</div> 
                                </div>))}
            </div>
            <Typography component={"div"} variant="caption"><a href="https://en.wikipedia.org/wiki/Truncated_mean" target="_blank">[*] Truncated mean (x2 standard deviation)</a></Typography>
            <Typography variant="caption">[**] Compared against your same gender </Typography>
            </>
            }
        { data && !facts && <div>No data yet...</div>}
    </SoftBox>
}

const Rank = ({ value })=>{
    const classes = useStyles();
    const special = [classes.rank1, classes.rank2, classes.rank3 ][ value ] ?? "";
    return <div className={classes.rank+" "+special}>#{value+1}</div>
}


//by chatGPT lol...
function calculateAverage(numbers) {
    // Calculate the mean (average) of the array
    const sum = numbers.reduce((acc, curr) => acc + curr, 0);
    const mean = sum / numbers.length;

    // Calculate the standard deviation
    const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2));
    const variance = squaredDifferences.reduce((acc, curr) => acc + curr, 0) / numbers.length;
    const standardDeviation = Math.sqrt(variance);

    // Define a threshold for outliers (e.g., 2 standard deviations)
    const threshold = 2 * standardDeviation;

    // Filter out values that deviate too much from the mean
    const filteredNumbers = numbers.filter(num => Math.abs(num - mean) <= threshold);

    // Recalculate the mean based on the filtered array
    const filteredSum = filteredNumbers.reduce((acc, curr) => acc + curr, 0);
    const filteredMean = filteredSum / filteredNumbers.length;

    return filteredMean;
}
import { makeVar, useReactiveVar } from '@apollo/client';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@material-ui/core';
import { createContext, useContext } from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'; 

const $settingsPanelOpen = makeVar(false);

export const ActiveSettingContext = createContext(()=>{});


export const SettingDiv = ({title, desc, children})=>{

    const expanded  = useReactiveVar($settingsPanelOpen);
    const classes   = {}; //useSettingsStyles();
 

    return <ActiveSettingContext.Provider value={()=>$settingsPanelOpen(title)}>
                <Accordion expanded={expanded === title} onChange={ (event, isExpanded)=>$settingsPanelOpen(isExpanded? title : null) }>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />} 
                    >
                    <Typography>{ title }</Typography> &nbsp;( 
                    <Typography variant='caption'>{ desc || "..." }</Typography> )
                    </AccordionSummary>
                    <AccordionDetails style={{ flexDirection:"column"}}>
                        {children}
                    </AccordionDetails>
                </Accordion>
            </ActiveSettingContext.Provider>
}
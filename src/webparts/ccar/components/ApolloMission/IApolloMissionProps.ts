import { 
    IMissionListItem,
    MissionOperationCallback
  } from "../../../../models/index";
  
  export interface IApolloMissionProps {
    mission?: IMissionListItem;
    onRemoveMission: any;
  }
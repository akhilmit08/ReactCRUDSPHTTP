import { 
  IMissionListItem,
  MissionOperationCallback
} from "../../../../models";

export interface IApolloMissionListProps {
  missions?: IMissionListItem[];
  onDeleteMission: any;
 
}

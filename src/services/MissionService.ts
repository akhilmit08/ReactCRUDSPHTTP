import {
    SPHttpClient,
    SPHttpClientResponse,
    ISPHttpClientOptions
  } from '@microsoft/sp-http';
  
  import { IMissionListItem } from '../models';
  
  const LIST_API_ENDPOINT: string = `/_api/web/lists/getbytitle('Apollo Missions')`;
  const SELECT_QUERY: string = '$select=Id,Title,Commander,SrPilotCmPilot,PilotLmPilot,LaunchDate,ReturnDate';
  
  export class MissionService {

    private static _missions: IMissionListItem[] = <IMissionListItem[]>[
      {
        "Id": 201,
        "Title": "Test1",
        "LaunchDate": "02/26/1966",
        "ReturnDate": ""
      },
      {
        "Id": 203,
        "Title": "Test2",
        "launch_date": "07/05/1966",
        "ReturnDate": ""
      },
    ];

    public static getMissions(): IMissionListItem[] {
      return this._missions;
    }
  
    /**
     * Setup common headers for different requests.
     */
    private _spHttpOptions: any = {
      getNoMetadata: <ISPHttpClientOptions>{
        headers: { 'ACCEPT': 'application/json; odata.metadata=none' }
      },
      getFullMetadata: <ISPHttpClientOptions>{
        headers: { 'ACCEPT': 'application/json; odata.metadata=full' }
      },
      postNoMetadata: <ISPHttpClientOptions>{
        headers: {
          'ACCEPT': 'application/json; odata.metadata=none',
          'CONTENT-TYPE': 'application/json',
        }
      },
      updateNoMetadata: <ISPHttpClientOptions>{
        headers: {
          'ACCEPT': 'application/json; odata.metadata=none',
          'CONTENT-TYPE': 'application/json',
          'X-HTTP-Method': 'MERGE'
        }
      },
      deleteNoMetadata: <ISPHttpClientOptions>{
        headers: {
          'ACCEPT': 'application/json; odata.metadata=none',
          'CONTENT-TYPE': 'application/json',
          'X-HTTP-Method': 'DELETE'
        }
      }
    };
  
    constructor(private siteAbsoluteUrl: string, private client: SPHttpClient) { }

    public _getListItems(): Promise<IMissionListItem[]> {
      const url: string = this.siteAbsoluteUrl + "/_api/web/lists/getbytitle('Apollo Missions')/items";
      return this.client.get(url,SPHttpClient.configurations.v1)
      .then(response => {
      return response.json();
      })
      .then(json => {
      return json.value;
      }) as Promise<IMissionListItem[]>;
      }
  
  
    /**
     * Return collection of all NASA Apollo missions.
     *
     * @returns {IMission[]}      Collection of missions.
     * @memberof MissionService
     */
    public getMissions(): Promise<IMissionListItem[]> {
      let promise: Promise<IMissionListItem[]> = new Promise<IMissionListItem[]>((resolve, reject) => {
        this.client.get(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}/items?${SELECT_QUERY}`,
          SPHttpClient.configurations.v1,
          this._spHttpOptions.getNoMetadata
        ) // get response & parse body as JSON
          .then((response: SPHttpClientResponse): Promise<{ value: IMissionListItem[] }> => {
            return response.json();
          }) // get parsed response as array, and return
          .then((response: { value: IMissionListItem[] }) => {
            resolve(response.value);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
  
      return promise;
    }
  
    /**
     * Retrieve a single mission using the specified mission ID.
     *
     * @static
     * @param {string}    missionId - ID of the mission to retrieve.
     * @returns {IMission}
     * @memberof MissionService
     */
    public getMission(missionId: number): Promise<IMissionListItem> {
      let promise: Promise<IMissionListItem> = new Promise<IMissionListItem>((resolve, reject) => {
        this.client.get(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}/items(${missionId})?${SELECT_QUERY}`,
          SPHttpClient.configurations.v1,
          this._spHttpOptions.getFullMetadata
        ) // get response & parse body as JSON
          .then((response: SPHttpClientResponse): Promise<IMissionListItem> => {
            return response.json();
          }) // get parsed response as array, and return
          .then((response: IMissionListItem) => {
            resolve(response);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
      return promise;
    }
  
    /**
     * Retrieve a single mission as the last one i the list
     *
     * @static
     * @returns {IMission}
     * @memberof MissionService
     */
    public getLastMission(): Promise<IMissionListItem> {
      let promise: Promise<IMissionListItem> = new Promise<IMissionListItem>((resolve, reject) => {
        this.client.get(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}/items?${SELECT_QUERY}&$orderby=ID desc&$top=1`,
          SPHttpClient.configurations.v1,
          this._spHttpOptions.getFullMetadata
        ) // get response & parse body as JSON
          .then((response: SPHttpClientResponse): Promise<any> => {
            return response.json();
          }) // get parsed response as array, and return
          .then((response: any) => {
            resolve(response.value[0]);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
      return promise;
    }
  
    /**
     * Retrieve the entity type as a string for the list
     *
     * @private
     * @returns {Promise<string>}
     * @memberof MissionService
     */
    private _getItemEntityType(): Promise<string> {
      let promise: Promise<string> = new Promise<string>((resolve, reject) => {
        this.client.get(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}?$select=ListItemEntityTypeFullName`,
          SPHttpClient.configurations.v1,
          this._spHttpOptions.getNoMetadata
        )
          .then((response: SPHttpClientResponse): Promise<{ ListItemEntityTypeFullName: string }> => {
            return response.json();
          })
          .then((response: { ListItemEntityTypeFullName: string }): void => {
            resolve(response.ListItemEntityTypeFullName);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
      return promise;
    }
  
    /**
     * Create a single mission on the list.
     *
     * @param {IMissionListItem} newMission mission to create.
     * @returns {Promise<void>}
     * @memberof MissionService
     */
    public createMission(newMission: IMissionListItem): Promise<void> {
      let promise: Promise<void> = new Promise<void>((resolve, reject) => {
        // first, get the type of thing we're creating...
        this._getItemEntityType()
          .then((spEntityType: string) => {
            // create item to create
            let newListItem: IMissionListItem = newMission;
            // add SP-required metadata
            newListItem['@odata.type'] = spEntityType;
  
            // build request
            let requestDetails: any = this._spHttpOptions.postNoMetadata;
            requestDetails.body = JSON.stringify(newListItem);
  
            // create the item
            return this.client.post(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}/items`,
              SPHttpClient.configurations.v1,
              requestDetails
            );
          })
          .then((response: SPHttpClientResponse): Promise<IMissionListItem> => {
            return response.json();
          })
          .then((newSpListItem: IMissionListItem): void => {
            resolve();
          })
          .catch((error: any) => {
            reject(error);
          });
      });
      return promise;
    }
  
    /**
     * Update specified mission.
     *
     * @param {IMissionListItem} missionToUpdate  Mission to update.
     * @returns {Promise<void>}
     * @memberof MissionService
     */
    public updateMission(missionToUpdate: IMissionListItem): Promise<void> {
      let promise: Promise<void> = new Promise<void>((resolve, reject) => {
        // build request
        let requestDetails: any = this._spHttpOptions.updateNoMetadata;
        requestDetails.headers['IF-MATCH'] = missionToUpdate['@odata.etag'];
        requestDetails.body = JSON.stringify(missionToUpdate);
  
        // submit delete
        this.client.post(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}/items(${missionToUpdate.Id})`,
          SPHttpClient.configurations.v1,
          requestDetails
        )
          .then(() => {
            resolve();
          });
      });
      return promise;
    }
  
    /**
     * Delete the specified mission.
     *
     * @param {IMissionListItem} missionToDelete  Mission to delete.
     * @returns {Promise<void>}
     * @memberof MissionService
     */
    public deleteMission(missionToDelete: IMissionListItem): Promise<void> {
      let promise: Promise<void> = new Promise<void>((resolve, reject) => {
        // build request
        let requestDetails: any = this._spHttpOptions.deleteNoMetadata;
        requestDetails.headers['IF-MATCH'] = missionToDelete['@odata.etag'];
  
        // submit delete
        this.client.post(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}/items(${missionToDelete.Id})`,
          SPHttpClient.configurations.v1,
          requestDetails
        )
          .then(() => {
            resolve();
          });
      });
      return promise;
    }
  
   
  
   

  
  } // class MissionService
  
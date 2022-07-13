import { RankingInfo } from "../rankingInfo.interface"

export class ResponseRaidDto {

    topRankerInfoList: RankingInfo[]
    myRankingInfo: RankingInfo  

        
  public static usersInfo(a: any, b: any) {
    const response = new ResponseRaidDto();

    response.topRankerInfoList = a;
    response.myRankingInfo = b;

    return response;
  }

}
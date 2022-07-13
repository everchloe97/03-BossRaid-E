import axios from 'axios';

/* 
     작성자 : 염하늘
*/

export default class AxiousHelper {
  public static async getInstance() {
    const url = process.env.STATIC_DATA_URL;
    return await axios.get(url);
  }
}

// 사용시 const response = await AxiousHelper.getInstance();
import AsyncStorage from "@react-native-async-storage/async-storage";

const setData =(data:any)=>{
    AsyncStorage.setItem('data', JSON.stringify(data));
}
const getData =()=>{
    AsyncStorage.getItem('data');

}
const removeData =()=>{
    AsyncStorage.removeItem('data');
}

export {setData,getData,removeData}
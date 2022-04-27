// Unique Id Generator
//
let date = new Date();
const haulk_uid = {};

haulk_uid.v1 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

haulk_uid.v2 = () => {
    const head = Date.now().toString(36);
    const month= date.getMonth();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const millisecond = date.getMilliseconds();


    const tail = 'xxxxx-xxxxx-xxxxx-xxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    return `M${month}-H${hour}-Mi${minute}-S${second}-MS${millisecond}-${head}-${tail}`;
}


// console.log(`${newDate.toDateString()}${newDate.toTimeString()}`);
module.exports = haulk_uid;
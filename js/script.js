
var videoDataFromLocalStorage = [];

$(function(){
    loadVideoData();
    var data = [
        {text:"運動",value:"sport"},
        {text:"網際網路",value:"internet"},
        {text:"應用系統整合",value:"system"},
        {text:"家庭保健",value:"home"},
        {text:"語言",value:"language"}
    ]

    $("#videoWindow").kendoWindow({
        width: 500,
        height:600,
        modal: true, //覆蓋後面的畫面
        title: "新增影片",
        visible: false, //決定一開始可以看見嗎
        close: onClose,
    }); //新增影片的window

    $("#videoCategory").kendoDropDownList({
        dataTextField: "text", //顯示的字
        dataValueField: "value", //值
        dataSource: data, //資料來源
        index: 0, //預設在哪個選項
        change: onChange
    });//影片種類下拉選單
    $("#boughtDatepicker").kendoDatePicker({
        format: "yyyy-MM-dd", //設定DatePicker的格式
        value: new Date(), //設定預設值為今天
        max: new Date() //設定最大不能超過今天
    }); //購買日期的日期選擇器
    //$("#boughtDatepicker").attr("readonly", true); //購買日期的input設定為不可填寫，但可以用kendoDatePicker填寫
    
    $("#videoGrid").kendoGrid({ //影片表格
        dataSource: {
            data: videoDataFromLocalStorage, //資料來源
            schema: { //配置
                model: { //資料模型
                    fields: {
                        VideoId: {type:"int"},
                        VideoName: { type: "string" },
                        VideoCategory: { type: "string" },
                        VideoAuthor: { type: "string" },
                        VideoBoughtDate: { type: "string" }
                    }
                }
            },
            pageSize: 20, //最多顯示幾筆
        },
        //toolbar: ["search"],
        toolbar: kendo.template("<div class='video-grid-toolbar'><input id='searchText' class='video-grid-search' placeholder='我想要找......' type='text'></input></div>"), //工具列
        height: 550,
        sortable: true, //開啟排序功能
        pageable: {
            input: true,
            numeric: false //頁碼選擇器
        }, //分頁
        columns: [ //欄位配置
            { field: "VideoId", title: "影片編號",width:"10%"}, //field取dataSource裡對應的Key
            { field: "VideoName", title: "影片名稱", width: "50%" },
            { field: "VideoCategory", title: "影片種類", width: "10%" },
            { field: "VideoAuthor", title: "作者", width: "15%" },
            { field: "VideoBoughtDate", title: "購買日期", width: "15%" },
            { command: { name: "btnDelete", text: "刪除", click: deleteVideo }, title: " ", width: "120px" }
        ]
        
    });
    
    $("#searchText").on("input", searchVideo); //搜尋
    $("#btnOpen").on("click",openWindow); //開啟Window
    $("#btnAdd").on("click",addVideo); //新增
    
})


//功能作用：新增影片
function addVideo(e){
    e.preventDefault(); //取消事件的預設行為
    if ( $("#formAdd").kendoValidator().data("kendoValidator").validate() ) { //驗證成功進行新增
        var videoList = $("#videoGrid").data("kendoGrid").dataSource.data(); //取得dataSource的資料
        var query = new kendo.data.Query(videoList); //建立一個data存入dataSource裡的資料
        var sortData = query.sort({ field: "VideoId", dir: "desc" }).data; //將VideoId由大到小排序
        var lastVideoId = sortData[0].VideoId; //找到排序後的第一筆的VideoId
        var videoOne = { //User填入的資料
            "VideoId": lastVideoId + 1, //將Id加1傳入
            "VideoCategory": $("#videoCategory").data("kendoDropDownList").text(),
            "VideoName": $("#videoName").val(),
            "VideoAuthor": $("#videoAuthor").val(),
            "VideoBoughtDate": $("#boughtDatepicker").val(),
            "VideoPublisher": "" //沒有出版社
        }
        $("#videoName").val("");
        $("#videoAuthor").val("");
        var todayDate = kendo.toString(kendo.parseDate(new Date()), 'yyyy-MM-dd');
        $("#boughtDatepicker").data("kendoDatePicker").value(todayDate);
        $("#videoGrid").data("kendoGrid").dataSource.add(videoOne); //將新增的資料加進dataSource裡
        localStorage.setItem("videoData",JSON.stringify(videoList)) //將videoList轉換為 JSON 再存入local storage

        $("#videoWindow").data("kendoWindow").close();  //關閉window視窗
    } else { //驗證失敗顯示提示框
        $("<div></div>").kendoAlert({
            content:"請填寫完整再送出！",
            messages:{
              okText: "確認"
            }
          }).data("kendoAlert").open();
        //kendo.alert("請填寫完整再送出！"); //提示框
    }
    
}

//功能作用：將video-data存入local storage
function loadVideoData(){  
    
    videoDataFromLocalStorage = JSON.parse(localStorage.getItem("videoData"));
    if(videoDataFromLocalStorage == null){
        videoDataFromLocalStorage = videoData;
        localStorage.setItem("videoData",JSON.stringify(videoDataFromLocalStorage));
    }
}

//功能作用：搜尋影片
function searchVideo() {
    //設定過濾的條件
     var filter = { logic: "or", filters: [] }; //將過濾邏輯設為or，因為要比較很多個欄位，所以要用or串起來
      searchValue = $("#searchText").val(); //取得搜尋的值
      var videoColumn = $("#videoGrid").data("kendoGrid").columns
      if (searchValue) { 
             $.each(videoColumn, //把videoGrid的欄位都跑一便
                 function (key, value) { 
                    //將欄位依照過濾的條件做設定：field要搜尋的欄位，搜尋方式為包含，搜尋的值是input輸入的值
                    filter.filters.push({ field: value.field,
                        operator: "contains", value: searchValue 
                    });                       
                 });
       }
       //查詢
       $("#videoGrid").data("kendoGrid").dataSource.filter(filter);  //將過濾條件放至filter裡
}

//功能作用：淡入按鈕
function onClose() {
     //$("#btnOpen").fadeIn(); //將按鈕淡入
}

//功能作用：開啟window
function openWindow () {
    $("#videoWindow").data("kendoWindow").center().open(); //將window置於畫面中間打開
    //$("#btnOpen").hide(); //隱藏按鈕
}

//功能作用：變更圖片
function onChange(){
    $("#videoImage").attr("src","image/"+ $("#videoCategory").val() + ".jpg") //變更圖片路徑
    $("#videoImage").attr("alt",$("#videoCategory").val()) //變更圖片替代文字
}

//功能作用：刪除影片
function deleteVideo(e){
    e.preventDefault(); //取消事件的預設行為
    var grid = $("#videoGrid").data("kendoGrid"); 
    var row = $(e.target).closest("tr"); //e.target：指的是觸發事件的物件。 closest：返回被選元素的第一個祖先元素
    $("<div></div>").kendoConfirm({
        content: "確定要刪除嗎？",
        actions: [{
            text: "確認",
            action: function(e){
                grid.removeRow(row); //刪除指定的行，同時刪除dataSource裡對應的數據。
                localStorage.setItem("videoData",JSON.stringify(grid.dataSource.data())) //把dataSource裡的data存入videoData，取代原本videoData的資料
              return true;
            },
            primary: true //按鈕顏色
            },{
              text: "取消" 
          }]
      }).data("kendoConfirm").open();

}


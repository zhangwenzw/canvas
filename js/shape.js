function shape(canvas,copy,cobj,xpObj){
    this.canvas=canvas;
    this.copy=copy;
    this.cobj=cobj;
    this.xpObj=xpObj;
    this.width=this.canvas.width;
    this.height=this.canvas.height;
    this.lineWidth=2;
    this.type="line";
    this.style="stroke";
    this.strokeStyle="#000";
    this.fillStyle="#000";
    this.history=[];
    this.side=3;
    this.corner=5;
    this.isback=true;
    this.isshow=true;
    this.xpsize=10;
}
shape.prototype={
    init:function(){
        this.cobj.lineWidth=this.lineWidth;
        this.cobj.strokeStyle=this.strokeStyle;
        this.cobj.fillStyle=this.fillStyle;
    },
    draw:function(){
        var that=this;
        this.copy.onmousedown=function(e){
            var sx= e.offsetX;
            var sy= e.offsetY;
            that.copy.onmousemove=function(e){
                var mx= e.offsetX;
                var my= e.offsetY;
                that.init();
                that.cobj.clearRect(0,0,that.width,that.height);
                if(that.history.length>0){
                    that.cobj.putImageData(that.history[that.history.length-1],0,0);
                }
                that.cobj.beginPath();
                that[that.type](sx,sy,mx,my);
            }
            that.copy.onmouseup=function(){
                that.history.push(that.cobj.getImageData(0,0,that.width,that.height));
                that.copy.onmousemove=null;
                that.copy.onmouseup=null;
            }
        }
    },
    line:function(x1,y1,x2,y2){
        this.cobj.moveTo(x1,y1);
        this.cobj.lineTo(x2,y2);
        this.cobj.stroke();
    },
    rect:function(x1,y1,x2,y2){
        this.cobj.rect(x1,y1,x2-x1,y2-y1);
        this.cobj[this.style]();
    },
    arc:function(x1,y1,x2,y2){
        var r=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
        this.cobj.arc(x1,y1,r,0,2*Math.PI);
        this.cobj[this.style]();
    },
    polygon:function(x1,y1,x2,y2){
        var r=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
        var angle=360/this.side*Math.PI/180;
        for(var i=0;i<this.side;i++){
            var x=Math.cos(angle*i)*r+x1;
            var y=Math.sin(angle*i)*r+y1;
            this.cobj.lineTo(x,y);
        }
        this.cobj.closePath();
        this.cobj[this.style]();
    },
    star:function(x1,y1,x2,y2){
        var r=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
        var sr=r/3;
        var angle=360/(this.corner*2)*Math.PI/180;
        for(var i=0;i<this.corner*2;i++){
            if(i%2==0){
                this.cobj.lineTo(Math.cos(angle*i)*r+x1,Math.sin(angle*i)*r+y1);
            }else{
                this.cobj.lineTo(Math.cos(angle*i)*sr+x1,Math.sin(angle*i)*sr+y1);
            }
        }
        this.cobj.closePath();
        this.cobj[this.style]();
    },
    pencil:function(){
        var that=this;
        that.copy.onmousedown=function(e){
            var sx= e.offsetX;
            var sy= e.offsetY;
            that.cobj.beginPath();
            that.cobj.moveTo(sx,sy);
            that.copy.onmousemove=function(e){
                var mx= e.offsetX;
                var my= e.offsetY;
                that.init();
                that.cobj.clearRect(0,0,that.width,that.height);
                if(that.history.length>0){
                    that.cobj.putImageData(that.history[that.history.length-1],0,0);
                }
                that.cobj.lineTo(mx,my);
                that.cobj.stroke();
            }
            that.copy.onmouseup=function(){
                that.history.push(that.cobj.getImageData(0,0,that.width,that.height));
                that.copy.onmousemove=null;
                that.copy.onmouseup=null;
            }
        }
    },
    //橡皮
    eraser:function(){
        var that=this;
        if(!that.isshow){
            return;
        }
        this.copy.onmousemove=function(e){
            var movex= e.offsetX;
            var movey= e.offsetY;
            var lefts=movex-that.xpsize/2;
            var tops=movey-that.xpsize/2;
            if(lefts<0||tops<0||lefts>that.width-that.xpsize||tops>that.height-that.xpsize){
                that.xpObj.css({opacity:0});
            }else{
                that.xpObj.css({opacity:1});
            }
            that.xpObj.css({
                "display":"block",
                "left":lefts,
                "top":tops,
                "width":that.xpsize,
                "height":that.xpsize
            })
        }
        this.copy.onmousedown=function(e){
            that.copy.onmousemove=function(e){
                var movex= e.offsetX;
                var movey= e.offsetY;
                var lefts=movex-that.xpsize/2;
                var tops=movey-that.xpsize/2;
                if(lefts<0||tops<0||lefts>that.width-that.xpsize||tops>that.height-that.xpsize){
                    that.xpObj.css({opacity:0});
                }else{
                    that.xpObj.css({opacity:1});
                }
                that.xpObj.css({
                    "display":"block",
                    "left":lefts,
                    "top":tops,
                    "width":that.xpsize,
                    "height":that.xpsize
                })
                that.cobj.clearRect(lefts,tops,that.xpsize,that.xpsize);
            }
            that.copy.onmouseup=function(){
                that.copy.onmouseup=null;
                that.copy.onmousemove=null;
                that.eraser();
                that.history.push(that.cobj.getImageData(0,0,that.width,that.height));
            }
        }
        that.isshow=false;
    },
    /*马赛克*/
    mosaic:function(dataobj,num,x,y){
        var width = dataobj.width, height = dataobj.height;
        var num = num;
        var w = width / num;
        var h = height / num;
        for (var i = 0; i < num; i++) {//行
            for (var j = 0; j < num; j++) {//列  x
                var dataObj = cobj.getImageData(j * w, i * h, w, h);
                var r = 0, g = 0, b = 0;
                for (var k = 0; k < dataObj.width * dataObj.height; k++) {
                    r += dataObj.data[k * 4 + 0];
                    g += dataObj.data[k * 4 + 1];
                    b += dataObj.data[k * 4 + 2];
                }
                r = parseInt(r / (dataObj.width * dataObj.height));
                g = parseInt(g / (dataObj.width * dataObj.height));
                b = parseInt(b / (dataObj.width * dataObj.height));
                for (var k = 0; k < dataObj.width * dataObj.height; k++) {
                    dataObj.data[k * 4 + 0] = r;
                    dataObj.data[k * 4 + 1] = g;
                    dataObj.data[k * 4 + 2] = b;
                }
                cobj.putImageData(dataObj, x + j * w, y+i * h);
            }
        }
    },
    /*模糊*/
    blur:function(dataobj,num,x,y){
        var width = dataobj.width, height = dataobj.height;
        var arr=[];
        var num = num;
        for (var i = 0; i < width; i++) {//行
            for (var j = 0; j < height; j++) {//列  x
                var x1=j+num>width?j-num:j;
                var y1=i+num>height?i-num:i;
                var dataObj = cobj.getImageData(x1, y1,num, num);
                var r = 0, g = 0, b = 0;
                for (var k = 0; k < dataObj.width * dataObj.height; k++) {
                    r += dataObj.data[k * 4 + 0];
                    g += dataObj.data[k * 4 + 1];
                    b += dataObj.data[k * 4 + 2];
                }
                r = parseInt(r / (dataObj.width * dataObj.height));
                g = parseInt(g / (dataObj.width * dataObj.height));
                b = parseInt(b / (dataObj.width * dataObj.height));
                arr.push(r,g,b,255);
            }
        }
        for(var i=0;i<dataobj.data.length;i++){
            dataobj.data[i]=arr[i]
        }
        cobj.putImageData(dataobj,x,y);
    },
    //反向
    fx:function(dataobj,x,y){
        for(var i=0;i<dataobj.width*dataobj.height;i++){
            dataobj.data[i*4+0]=255-dataobj.data[i*4+0];
            dataobj.data[i*4+1]=255-dataobj.data[i*4+1];
            dataobj.data[i*4+2]=255-dataobj.data[i*4+2];
            dataobj.data[i*4+3]=255;
        }
        cobj.putImageData(dataobj,x,y);
    }


}
require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

// 获取图片信息
// import imageDatass from '../data/imageData.json';
let imageDatass = require('../data/imageData.json');

//将图片名信息转化成图片路径信息
const imageDatas = imageDatass.map((image)=>{
  image.imageURL = require('../images/'+image.fileName); /*影响文件打包必须用require*/
  return image;
});
  const getRangeRandom = (low,high) => Math.floor(Math.random()*(high-low)+low);
  const getDegRandom = () => Math.floor(Math.random()*60-30);

  /*图片组件*/
class ImgFigure extends React.Component {
  constructor(props){
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e){
    if(this.props.arrange.iscenter){
      this.props.inverse();
    }
    else{ this.props.center();}

    e.stopPropagation();
    e.preventDefault();
  }
  render() {
    let styleObj = {};
    if(this.props.arrange.pos){
      styleObj = this.props.arrange.pos;
    }
    if(this.props.arrange.rotate){
      let prefixArr =  ['MozTransform','MsTransform','WebkitTransform','transform'];
      prefixArr.forEach( value => {
        styleObj[value] = `rotate(${this.props.arrange.rotate}deg)`;
    })
    }
    if(this.props.arrange.iscenter){
      styleObj.zIndex = 11;
    }
    let imgfClassName = 'img-figure';
    imgfClassName+= this.props.arrange.isinverse ? ' is-inverse' : '';
    return (
      <figure className={imgfClassName} style={styleObj} onClick={this.handleClick}>
        <img src={this.props.data.imageURL} alt={this.props.data.title}/>
        <figcaption>
          <h2 className="img-title">
            {this.props.data.title}
          </h2>
          <div className="img-back"  onClick={this.handleClick}>
            <p>
              {this.props.data.desc}
            </p>
          </div>
        </figcaption>
      </figure>
    )
}
}

/*控制组件*/
class ControllerUnits extends React.Component{
  constructor(props){
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e){
    e.preventDefault();
    e.stopPropagation();
    if(this.props.arrange.iscenter){
      this.props.inverse();
    }
    else{
      this.props.center();
    }
  }
  render(){
    let controllerClassName = 'controller-unit';
    controllerClassName+= this.props.arrange.iscenter ?　' is-center' : '';
    controllerClassName+= this.props.arrange.isinverse ? ' is-inverse' :　'';
    return (
      <span className={controllerClassName} onClick={this.handleClick}></span>
    )
  }
}

/*总组件*/
class AppComponent extends React.Component {
  constructor(props){
    super(props); /*在ES6中，在子类的constructor中必须先调用super才能引用this super(props)的目的：在constructor中可以使用this.props*/
    this.Constant = {  /*中心图片*/
      centerPos: {
        left: 0,
        top: 0
      },
      leftSection: {
        x: [0,0],
        y: [0,0]
      },
      rightSection: {
        x:[0,0],
        y:[0,0]
      },
      topSection: {
        x: [0,0],
        y: [0,0]
      }
    };
    /*定义图片state*/
    this.state = {
      imgsArrangeArr: [
        /* {
             pos:{ left:0, top:0}
             rotate: 0          //旋转角度
             isInverse： false  // 图片是否正反面
             isCenter: false   //图片是否居中
        }  */
      ]
    };
    }

    /*组件加载完成，图片位置渲染*/
    componentDidMount() {
      let stageDOM =  this.stage,                              /*ReactDOM.findDOMNode(this.refs.stage),*/
      stageW = stageDOM.scrollWidth,
      stageH = stageDOM.scrollHeight,
      halfStageW = Math.ceil(stageW/2),
      halfStageH = Math.ceil(stageH/2);

     /* 拿到imgFigure大小*/
      let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = Math.ceil(imgW/2),
        halfImgH = Math.ceil(imgH/2);
      /*计算中间图片位置*/
      this.Constant.centerPos = {
        left: halfStageW - halfImgW,
        top: halfStageH - halfImgH
      };
      /** 计算左扇区，x和y的临界值 */
      this.Constant.leftSection.x[0] = -halfImgW;                         // 左扇区最左值，这里设定最多超多舞台左边界图片宽度的一半
      this.Constant.leftSection.x[1] = halfStageW - halfImgW * 3;         // 左扇区最右值，注意这里绝对定位的left是指图片左边距离屏幕左边界的距离，所以这里是1.5倍图片宽度，临界情况是图片右边紧贴中心图片最左边
      this.Constant.leftSection.y[0] = -halfImgH;                         // 左扇区的最上，这里设定最多超多舞台上边界图片高度的一半
      this.Constant.leftSection.y[1] = stageH - halfImgH;                 // 左扇区的最下，这里设定高于舞台下边界图片高度的一半
      /** 计算右扇区，x和y的临界值*/
      this.Constant.rightSection.x[0] = halfStageW + halfImgW;            // 右扇区最左值，贴到中心图片的右边，距离中心线半个图片宽度
      this.Constant.rightSection.x[1] = stageW - halfImgW;                // 右扇区最右值，道理同左扇区最右值
      this.Constant.rightSection.y[0] =  this.Constant.leftSection.y[0];  // 同左扇区最上
      this.Constant.rightSection.y[1] =  this.Constant.leftSection.y[1];  // 同左扇区最下
      /** 计算上扇区，x和y的临界值 */
      this.Constant.topSection.y[0] = -halfImgH;                          // 上扇区最上，同左右扇区最上
      this.Constant.topSection.y[1] = halfStageH - halfImgH * 3;          // 上扇区最下，道理同左扇区最右值
      this.Constant.topSection.x[0] = halfStageW - imgW;                  // 上扇区最左，中轴线往左一个图片宽度
      this.Constant.topSection.x[1] = halfStageW;                         // 上扇区最右，中轴线（注意left值是以左边为准）
      this.rearrange(0); //第一张默认居中
    }


    /*布局所有图片
    * centerIndex 指定中间图片index*/
     rearrange(centerIndex) {
       let imgsArrangeArr = this.state.imgsArrangeArr;
        let { centerPos,leftSection,rightSection,topSection } = this.Constant;

       /*布局中心图片*/
       let center = imgsArrangeArr.splice(centerIndex,1);
       center[0] = {    /*从数组中取出仍然是数组类型故center[0]*/
         pos: centerPos,
         iscenter: true
       };

       /*布局上扇区
       * 1.上扇区图片数量0或1,50%概率取到
       */
       let top = [];
       let topNum = Math.floor(Math.random()*2);
       let topIndex = Math.floor(Math.random()*(imgsArrangeArr.length-topNum));
       top = imgsArrangeArr.splice(topIndex,topNum);

       /*上扇区图片位置信息*/
       top.forEach((value,index)=>{
          top[index] = {
            pos: {
              top: getRangeRandom(topSection.y[0],topSection.y[1]),
              left: getRangeRandom(topSection.x[0],topSection.x[1])
            },
            rotate: getDegRandom(),
            iscenter: false

          }
       })

       /*左右扇区布局*/
       for(let i=0,j=imgsArrangeArr.length,k=j/2;i<j;i++){
         let xRang = i<k ? leftSection.x : rightSection.x;
         imgsArrangeArr[i] = {
           pos: {
             top: getRangeRandom(leftSection.y[0],leftSection.y[1]),
             left:　getRangeRandom(xRang[0],xRang[1])
           },
           rotate: getDegRandom(),
           iscenter: false
         }
       }

        /*将splic出来的数组重新放入imgsArrangeArr*/
        if(top&&top[0]){
          imgsArrangeArr.splice(topIndex,0,top[0]);
        }
        imgsArrangeArr.splice(centerIndex,0,center[0]);
        this.setState({
          imgsArrangeArr: imgsArrangeArr
        })
     }

     /*返回图片翻转状态*/
    inverse(index){
      return () =>{
        let { imgsArrangeArr } = this.state;
        imgsArrangeArr[index].isinverse = !imgsArrangeArr[index].isinverse;
        this.setState({
          imgsArrangeArr }
        )
      }
     }

    /*控制居中图片*/
    center(index){
      return () =>{
        this.rearrange(index);}
    }


     /*render渲染*/
    render()
      {
      //定义图片，控制组件
      let controllerUnits = [],imgFigures = [];

      imageDatas.forEach((value,index)=>{
        if(!this.state.imgsArrangeArr[index]){
          this.state.imgsArrangeArr[index] = {
            pos:{
              left: 0,
              top:　0
            },
            rotate: 0,
            isinverse: false,
            iscenter: false
          }
        }

        /*push多个图片组件*/
        imgFigures.push(<ImgFigure key={index} data={value} ref={'imgFigure'+index} inverse={this.inverse(index)}  center={this.center(index)} arrange={this.state.imgsArrangeArr[index]}/>);

        /*push多个控制span*/
        controllerUnits.push(<ControllerUnits key={index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);
      });



      return (
        <section className="stage" ref={(input)=>{this.stage = input}}> {/*新版使用ref*/}
          <section className="img-sec">
            {imgFigures}
          </section>
          <nav className="controller-nav">
            {controllerUnits}
          </nav>
        </section>
      );
    }
}

AppComponent.defaultProps = {
};


export default AppComponent;

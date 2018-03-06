/** 
 * Catchlog.js
 */
import React from "react"
import { Link } from "react-router"
import axios from 'axios'
import Capture from './capture'
import Replace from './replace'
import Confirm from '../../../../sys/modal/confirm'
import Deviation from '../deviation'
import Remark from '../remark'
import { operatorHandle } from '../rule'

const deviceSet = {
  1: ['vn3', 'vn4', 'vn5', 'vn6', 'vc5'],
  2: ['vn1', 'vn2', 'vc1', 'vc2', 'vc3', 'growthShow'],
  3: ['vn3', 'vn4', 'vn5', 'vn6', 'vc6'],
  4: ['vn1', 'vn2', 'vlp', 'vc1', 'vc2', 'vc3', 'vc4', 'growthShow'],
}

const keyList = [
  'point_no', 'ldate',
  'catch_num1', 'catch_num2', 'catch_num3',
  'catch_num4', 'catch_num5', 'catch_num6',
  'change1', 'change2', 'change3',
  'change4', 'change5', 'change6',
  'check_lamp', 'rmk', 'discription', 'urmk'
]

const catchList = [
  { label: '承接', key: 'catch_num2', type: 'catch_num2', show: 'vn2' },
  { label: '壁虎', key: 'catch_num3', type: 'catch_num3', show: 'vn3' },
  { label: '昆蟲', key: 'catch_num4', type: 'catch_num4', show: 'vn4' },
  { label: '鼠類', key: 'catch_num5', type: 'catch_num5', show: 'vn5' },
  { label: '其他', key: 'catch_num6', type: 'catch_num6', show: 'vn6' },
]

const replaceList = [
  { label: '捕蚊紙', key: 'change1', type: 'change1', show: 'vc1' },
  { label: '捕蚊燈管', key: 'change3', type: 'change3', show: 'vc3' },
  { label: '驅蚊燈管', key: 'change4', type: 'change4', show: 'vc4' },
  { label: '粘鼠板', key: 'change5', type: 'change5', show: 'vc5' },
  { label: '粘鼠板+防蟻措施', key: 'change6', type: 'change6', show: 'vc6' },
]

export default class Catchlog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      point_no: '',
      log_data: [],
      alertMsg: [],
      rule: {},
      catch_num1: 0, catch_num2: 0, catch_num3: 0, catch_num4: 0, catch_num5: 0, catch_num6: 0,
      change1: 'N', change2: 'N', change3: 'N', change4: 'N', change5: 'N', change6: 'N', check_lamp: 'N',
      rmk: '', discription: '', deviation: 'N', urmk: '',
      changeDate: [],
      vn1: false, vn2: false, vn3: false, vn4: false, vn5: false, vn6: false,
      vc1: false, vc2: false, vc3: false, vc4: false, vc5: false, vc6: false,
      vlp: false,
      thisTotalCount: 0, lastTotalCount: 0,
      isLoading: false,
      growthShow: false,
      confirmShow: false,
      isDeviation: false,
      isChecked: false,
      isOverdue: false,
    }
    this.sendMsg = this.props.sendMsg.bind(this)
  }

  componentDidMount() {
    this.init()
  }

  init() {
    let self = this
    let point_no = this.props.pointInfo.point_no
    axios.get('/api/web/mpz/pointlog/catch/init/' + point_no)
      .then(function (response) {
        if (response.data.result) {
          console.log(response.data)
          self.setState({
            point_no: point_no,
            log_data: response.data.log_data,
            rule: response.data.rule,
            thisAllCount: response.data.thisAllCount,
            lastAllCount: response.data.lastAllCount,
            thisTotalCount: response.data.thisTotalCount,
            lastTotalCount: response.data.lastTotalCount,
            lastGrowth: response.data.lastGrowth,
            changeDate: response.data.changeDate,
            init: false,
          }, () => { 
            self.setValue()
            self.formCheck() 
          })
        } else {
          self.props.sendMsg(response.data.msg)
          self.onCancel()
        }
      }).catch(function (error) {
        console.log(error)
        self.props.sendMsg(error)
      })
  }

  setLayout() {
    let device = this.props.pointInfo.device_type
    deviceSet[device].map((item) => {
      this.setState({ [item]: true }, () => { 
        this.checkAllRequire() 
        this.lampCheck()
      })
    })
  }

  setValue() {
    this.setLayout()
    let data = this.state.log_data
    if (data !== null) {
      this.setState({
        point_no: data.point_no, ldate: data.ldate,
        catch_num1: Number(data.catch_num1), catch_num2: Number(data.catch_num2), catch_num3: Number(data.catch_num3),
        catch_num4: Number(data.catch_num4), catch_num5: Number(data.catch_num5), catch_num6: Number(data.catch_num6),
        change1: data.change1, change2: data.change2, change3: data.change3,
        change4: data.change4, change5: data.change5, change6: data.change6, check_lamp: data.check_lamp,
        rmk: data.rmk || '', discription: data.discription, deviation: data.deviation, urmk: data.urmk,
      }, () => { this.formCheck() })
    }
  }

  initState() {
    this.setState({
      catch_num1: 0, catch_num2: 0, catch_num3: 0, catch_num4: 0, catch_num5: 0, catch_num6: 0,
      change1: 'N', change2: 'N', change3: 'N', change4: 'N', change5: 'N', change6: 'N', check_lamp: 'N',
      rmk: '', discription: '', deviation: 'N', urmk: '',
      changeDate: [],
      vn1: false, vn2: false, vn3: false, vn4: false, vn5: false, vn6: false,
      vc1: false, vc2: false, vc3: false, vc4: false, vc5: false, vc6: false,
      vlp: false,
      thisTotalCount: 0, lastTotalCount: 0,
      isLoading: false, growthShow: false, confirmShow: false,
      isDeviation: false, isChecked: false, isOverdue: false,
    })
  }

  catchChange(item, e) {
    const { isChecked } = this.state
    let val = Number(e.target.value)
    this.setState({ [item]: val }, () => { this.checkAllCatchAmount(isChecked) })
  }

  rmkChange(e) {
    this.setState({ rmk: e.target.value })
    this.checkFillTime(e.target.value)
  }

  checkboxChange(item, e) {
    let state, value
    state = this.state[item.key]
    value = state === 'Y' ? 'N' : 'Y'
    this.setState({ [item.key]: value }, () => { this.checkRequire(item, this.state[item.show], value) })
  }

  lampChange(type) {
    this.setState({ check_lamp: type }, () => { this.lampCheck() }) 
  }

  lampCheck() {
    const { vl, check_lamp, isChecked } = this.state
    if (vl && check_lamp === 'N' && !isChecked) {
      this.pushAlert('驅蚊燈異常')
    } else {
      this.removeAlert('驅蚊燈異常')
    } 
  }

  onSave() {
    this.setState({ confirmShow: false })
    let self = this
    this.setState({ isLoading: true })
    let form_data = new FormData()
    keyList.map((item) => {
      form_data.append(item, this.state[item])
    })
    form_data.append('deviation', this.state.isChecked ? 'Y' : 'N')
    axios.post('/api/web/mpz/pointlog/catch/save', form_data)
      .then(function (response) {
        if (response.data.result) {
          self.sendMsg(self.state.point_no + '檢查點記錄成功!')
          self.setState({ isLoading: false })
          self.initState()
          self.onCancel()
        } else {
          self.setState({ isLoading: false })
          console.log(response.data.msg)
        }
      }).catch(function (error) {
        console.log(error)
        self.sendMsg(error)
        self.setState({ isLoading: false })
      })
  }

  onCancel() {
    this.initState()
    this.props.onCancel()
  }

  openConfirm() {
    this.setState({ confirmShow: true })
  }

  hideConfirm() {
    this.setState({ confirmShow: false })
  }

  checkDeviation() {
    this.setState({ checkDeviation: true })
  }

  formCheck() {
    const { isChecked } = this.state
    //檢查填表時間
    this.checkFillTime()
    //檢查補獲數
    this.checkAllCatchAmount(isChecked)
    //檢查必填項目
    this.checkAllRequire()
  }

  checkFillTime() {
    let date = new Date()
    let hours = date.getHours() * 100
    //let hours = 800
    let { rmk, rule } = this.state
    let isOverdue = true
    //檢查填表時間
    if (operatorHandle(hours, rule.START_TIME.cond, Number(rule.START_TIME.val)) &&
      operatorHandle(hours, rule.END_TIME.cond, Number(rule.END_TIME.val))
    ) {
      isOverdue = false
    } else {
      if (operatorHandle(hours, rule.OTHER_TIME.cond, Number(rule.OTHER_TIME.val)) &&
        operatorHandle(hours, '>=', Number(rule.END_TIME.val)) && rmk !== ''
      ) {
        isOverdue = false
      } else {
        isOverdue = true
      }
    }
    this.setState({ isOverdue: isOverdue })
  }

  checkAllCatchAmount() {
    const { pointInfo } = this.props
    const { rule,
      thisTotalCount, lastTotalCount, lastGrowth,
      catch_num1, catch_num2, catch_num3,
      catch_num4, catch_num5, catch_num6,
    } = this.state
    const allCount = thisTotalCount + catch_num1 + catch_num2 + catch_num3 + catch_num4 + catch_num5 + catch_num6
    const thisGrowth = (allCount - lastTotalCount) / lastTotalCount
    let r = {}
    let n = 0
    if (rule.TWO_MONTH_GROWTH) {
      r = rule.TWO_MONTH_GROWTH
      let c1 = operatorHandle(thisGrowth, r.cond, r.val)
      let c2 = operatorHandle(lastGrowth, r.cond, r.val)
      n = this.setAlert(r, c1 && c2, n)
    }

    if (rule.GROWTH_MORE_LAST) {
      r = rule.GROWTH_MORE_LAST
      let v
      if (lastGrowth === 0) {
        v = thisGrowth
      } else {
        v = (thisGrowth - lastGrowth) / lastGrowth
      }
      let c = operatorHandle(v, r.cond, r.val)
      n = this.setAlert(r, c, n)
    }

    if (rule.MOUSE_MAT || rule.MOUSE_OFF) {
      r = rule.MOUSE_MAT ? rule.MOUSE_MAT : rule.MOUSE_OFF
      let c = operatorHandle(catch_num5, r.cond, r.val)
      n = this.setAlert(r, c, n)
    }

    if (rule.MONTH_TOTAL_MAT || rule.MONTH_TOTAL_OFF) {
      r = rule.MONTH_TOTAL_MAT ? rule.MONTH_TOTAL_MAT : rule.MONTH_TOTAL_OFF
      if (!operatorHandle(thisTotalCount, r.cond, r.val)) {
        let c2 = operatorHandle(allCount, r.cond, r.val)
        n = this.setAlert(r, c2, n)
      }
    }

    if (rule.TWO_MONTH_ALL_MAT || rule.TWO_MONTH_ALL_OFF) {
      r = rule.TWO_MONTH_ALL_MAT ? rule.TWO_MONTH_ALL_MAT : rule.TWO_MONTH_ALL_OFF
      if (!operatorHandle(lastTotalCount + thisTotalCount, r.cond, r.val)) {
        let c = operatorHandle(lastTotalCount + allCount, r.cond, r.val)
        n = this.setAlert(r, c, n)
      }
    }

    this.setState({ isDeviation: n > 0 })
  }

  checkAllRequire() {
    const { rule, changeDate } = this.state
    replaceList.map((item) => {
      this.checkRequire(item, this.state[item.show], this.state[item.key])
    })
  }

  checkRequire(item, show, value) {
    const { rule, changeDate } = this.state
    if (operatorHandle(Number(changeDate[item.key]['dday']), rule.CHANGE_REQUEST.cond, rule.CHANGE_REQUEST.val)
      && show && value === 'N') {
      this.pushAlert(item.label + '必須更換')
    } else {
      this.removeAlert(item.label + '必須更換')
    }
  }

  setAlert(r, b, n) {
    if (b && !this.state.isChecked) {
      this.pushAlert(r.dis + r.cond + r.val + ', 請開立偏差')
      return n + 1
    } else {
      this.removeAlert(r.dis + r.cond + r.val + ', 請開立偏差')
      return n
    }
  }

  pushAlert(msg) {
    let alertMsg = this.state.alertMsg
    if (alertMsg.indexOf(msg) < 0) {
      alertMsg.push(msg)
    }
    this.setState({ alertMsg: alertMsg })
  }

  removeAlert(msg) {
    let alertMsg = this.state.alertMsg
    if (alertMsg.indexOf(msg) >= 0) {
      alertMsg.splice(alertMsg.indexOf(msg), 1)
    }
    this.setState({ alertMsg: alertMsg })
  }

  deviationChange() {
    const { isChecked } = this.state
    this.setState({ isChecked: !isChecked }, () => { this.checkAllCatchAmount() })
  }

  render() {
    const { pointInfo } = this.props
    const {
      alertMsg, getInfo,
      init, isLoading, isChecked, isDeviation, isOverdue,
      thisTotalCount, lastTotalCount, lastGrowth,
      catch_num1, catch_num2, catch_num3,
      catch_num4, catch_num5, catch_num6,
    } = this.state
    const isComplete = !(this.state.log_data === null)
    const allCount = thisTotalCount + catch_num1 + catch_num2 + catch_num3 + catch_num4 + catch_num5 + catch_num6
    let thisGrowth = 0
    if (lastTotalCount > 0) {
      thisGrowth = (allCount - lastTotalCount) / lastTotalCount
    }
    let today = new Date()
    return (
      <div>
        {alertMsg.length > 0 &&
          <article className="message is-warning" style={{ marginBottom: '10px' }}>
            <div className="message-header">
              <p>請排除下列異常</p>
            </div>
            <div className="message-body">
              {alertMsg.map((item, index) => (
                <div key={index}>
                  {item}
                </div>
              ))}
            </div>
          </article>
        }
        <table className="table is-bordered table is-fullwidth">
          <tbody>
            <tr>
              <td colSpan={2}>
                <span className="title is-4">鼠蟲防治記錄表</span>
                <span className="title is-5" style={{ marginLeft: '10px' }}>{pointInfo.device_name}</span>
                <span className="title is-6" style={{ marginLeft: '10px' }}>
                  日期：{today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate()}
                </span>
              </td>
            </tr>
            <tr>
              <td width="120">位置</td>
              <td>
                <span>{pointInfo.point_name}</span>
                <span style={{ marginLeft: '10px' }}>{pointInfo.point_des}</span>
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <div>
                  本月累計：{allCount}
                </div>
                {this.state.growthShow &&
                  <div>
                    本月累計成長率：{(thisGrowth * 100).toFixed(2) + '%'}
                  </div>
                }
                <div>
                  上月統計：{lastTotalCount}
                </div>
                {this.state.growthShow &&
                  <div>
                    上月成長率：{(lastGrowth * 100).toFixed(2) + '%'}
                  </div>
                }
              </td>
            </tr>
            <tr>
              <td>捕捉記錄</td>
              <td>
                {catchList.map((item, index) => {
                  if (this.state[item.show]) {
                    return (<Capture
                      key={index}
                      label={item.label}
                      value={this.state[item.key]}
                      onChange={this.catchChange.bind(this, item.type)}
                    />)
                  }
                })}
              </td>
            </tr>
            <tr>
              <td>更換工具</td>
              <td>
                {replaceList.map((item, index) => {
                  if (this.state[item.show]) {
                    return (<Replace
                      key={index}
                      label={item.label}
                      value={this.state[item.key]}
                      changeDate={this.state.changeDate}
                      rule={this.state.rule}
                      checked={this.state[item.key]}
                      type={item.type}
                      onChange={this.checkboxChange.bind(this, item)}
                    />)
                  }
                })}
              </td>
            </tr>
            {this.state.vlp &&
              <tr>
                <td>撿查</td>
                <td>
                  <div className="field is-horizontal">
                    <div className="field-label is-normal" style={{ flexGrow: '0', paddingTop: '0px' }}>
                      <label className="label" style={{ width: '60px' }}>驅蚊燈</label>
                    </div>
                    <div className="field-body">
                      <div className="field has-addons">
                        <div className="control">
                          <label className="radio">
                            <input type="radio" name="lamp"
                              checked={this.state.check_lamp === 'Y'}
                              onChange={this.lampChange.bind(this, 'Y')}
                            />
                            正常
                          </label>
                          <label className="radio" style={{ marginLeft: '15px' }}>
                            <input type="radio" name="lamp"
                              checked={this.state.check_lamp === 'N'}
                              onChange={this.lampChange.bind(this, 'N')}
                            />
                            異常
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            }
            <tr>
              <td>逾時原因</td>
              <td>
                <select className="select"
                  placeholder="請選擇"
                  onChange={this.rmkChange.bind(this)}
                  value={this.state.rmk || ""}
                >
                  <option value=""></option>
                  <option value="參加集會">參加集會</option>
                  <option value="其它">其它</option>
                </select>
              </td>
            </tr>
            {this.state.rmk === '其它' &&
              <tr>
                <td>說明</td>
                <td>
                  <div className="field is-horizontal">
                    <div className="field-body">
                      <div className="field">
                        <div className="control">
                          <textarea className="textarea" placeholder="請輸入其它說明"
                            value={this.state.discription || ''}
                            onChange={this.catchChange.bind(this, 'discription')}
                          >
                          </textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            }
            <tr>
              <td>開立偏差</td>
              <td>
                <div className="field is-horizontal">
                  <div className="field-body">
                    <div className="field has-addons">
                      <div className="control">
                        <label className="checkbox">
                          <input type="checkbox"
                            value={this.state.isChecked}
                            checked={this.state.isChecked}
                            onChange={this.deviationChange.bind(this)}
                          />
                          <span style={{ fontSize: '16px', fontWeight: 'bolder' }}>
                            開立偏差
                            </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <Remark value={this.state.urmk} onChange={this.catchChange.bind(this, 'urmk')}/>
          </tbody>
        </table>
        <Deviation
          isLoading={isLoading}
          isComplete={isComplete}
          isDeviation={isDeviation}
          isChecked={isChecked}
          isOverdue={isOverdue}
          alert={alertMsg}
          onSave={this.openConfirm.bind(this)}
          onCancel={this.onCancel.bind(this)}
        />
        {this.state.confirmShow &&
          <Confirm
            show={this.state.confirmShow}
            title="送出表單確認"
            content="您是否確定要送出表單？"
            onConfirm={this.onSave.bind(this)}
            onCancel={this.hideConfirm.bind(this)}
            btnConfirm="確定"
            btnCancel="取消"
          />
        }
      </div>
    )
  }
}

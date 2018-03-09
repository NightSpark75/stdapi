/** 
 * Wetestlog.js
 */
import React from "react"
import { Link } from "react-router"
import axios from 'axios'
import { operatorHandle } from '../rule'
import Record from '../record'
import Exception from '../exception'
import Confirm from '../../../../sys/modal/confirm'
import Deviation from '../deviation'
import Remark from '../remark'

const keyList = [
  'point_no', 'zero',
  'mo_hum', 'mo_max', 'mo_min', 'mo_ed', 'mo_eh', 'mo_devia', 'mo_rmk', 'mo_dis', 'mo_urmk', 'mo_hde',
  'af_hum', 'af_max', 'af_min', 'af_ed', 'af_eh', 'af_devia', 'af_urmk', 'af_hde',
  'ev_hum', 'ev_max', 'ev_min', 'ev_ed', 'ev_eh', 'ev_devia', 'ev_urmk', 'ev_hde',
]

const key = ['_hum', '_max', '_min']
const keyLabel = ['顯示值', 'MAX', 'MIN']
const err = ['_ed', '_eh', '_devia', '_hde']
const errLabel = ['儀器異常', '溼度異常', '開立偏差', '已開立偏差']

let today = new Date()
let hours = today.getHours() * 100

export default class Wetestlog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      alertMsg: [],
      point_no: '', mach_no: '', ch_date: '', humi_high: '', humi_low: '',
      mo_hum: '', mo_max: '', mo_min: '', mo_rmk: '', mo_dis: '', mo_ed: 'N', mo_eh: 'N', mo_devia: 'N', mo_urmk: '', mo_hde: 'N',
      af_hum: '', af_max: '', af_min: '', af_ed: 'N', af_eh: 'N', af_devia: 'N', af_urmk: '', af_hde: 'N',
      ev_hum: '', ev_max: '', ev_min: '', ev_ed: 'N', ev_eh: 'N', ev_devia: 'N', ev_urmk: '', ev_hde: 'N',
      zero: 'N',
      log_data: {},
      isLoading: false,
      confirmShow: false,
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
    axios.get('/api/web/mpz/pointlog/wetest/init/' + point_no)
      .then(function (response) {
        if (response.data.result) {
          self.setState({
            point_no: point_no,
            rule: response.data.rule,
            mach_no: response.data.dev.mach_no,
            ch_date: response.data.dev.stadlj,
            log_data: response.data.log_data,
            humi_low: response.data.humi_low,
            humi_high: response.data.humi_high,
          }, () => {
            self.formCheck()
            self.setValue()
          })
          console.log(response.data)

        } else {
          self.props.sendMsg(response.data.msg)
          self.onCancel()
        }
      }).catch(function (error) {
        console.log(error)
        self.props.sendMsg(error)
      })
  }

  setValue() {
    let data = this.state.log_data
    if (data !== null) {
      this.setState({
        mo_hum: data.mo_hum, mo_max: data.mo_max, mo_min: data.mo_min, mo_urmk: data.mo_urmk, mo_hde: data.mo_hde,
        mo_rmk: data.mo_rmk, mo_dis: data.mo_dis, mo_ed: data.mo_ed, mo_eh: data.mo_eh, mo_devia: data.mo_devia,
        af_hum: data.af_hum, af_max: data.af_max, af_min: data.af_min, af_urmk: data.af_urmk, af_hde: data.af_hde,
        af_ed: data.af_ed, af_eh: data.af_eh, af_devia: data.af_devia,
        ev_hum: data.mo_hum, ev_max: data.ev_max, ev_min: data.ev_min, ev_urmk: data.ev_urmk, ev_hde: data.ev_hde,
        ev_ed: data.ev_ed, ev_eh: data.ev_eh, ev_devia: data.ev_devia,
        zero: data.zero,
      })
    }
  }

  onSave(e) {
    let self = this
    this.setState({ isLoading: true })
    let form_data = new FormData()
    keyList.map((item) => {
      form_data.append(item, this.state[item])
    })
    axios.post('/api/web/mpz/pointlog/wetest/save', form_data)
      .then(function (response) {
        if (response.data.result) {
          self.sendMsg(self.state.point_no + '檢查點記錄成功!')
          self.setState({ isLoading: false })
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

  inputChange(key, e) {
    let value = e.target.value
    this.setState({ [key]: value }, () => { this.inputCheck(key) })
  }

  formCheck() {
    this.checkFillTime()
    this.exceptionCheck()
  }

  checkFillTime() {
    const { rule, mo_rmk } = this.state
    let isOverdue = true
    if (this.checkTime() !== '') {
      isOverdue = false
      if (operatorHandle(hours, rule.MO_OTHER.cond, Number(rule.MO_OTHER.val)) &&
        operatorHandle(hours, '>=', Number(rule.MO_START.val))) {
        if (mo_rmk === '') {
          isOverdue = true
        } else {
          isOverdue = false
        }
      }
    }
    this.setState({ isOverdue: isOverdue })
  }

  inputCheck(key) {
    const { humi_high, humi_low, isChecked } = this.state
    const value = Number(this.state[key])
    if (key.substr(3, 2) === 'hu' && !isChecked) {
      if (Number(humi_high) < value) {
        this.pushAlert('顯示值超過上限，請註記異常')
      } else {
        this.removeAlert('顯示值超過上限，請註記異常')
      }
      if (Number(humi_low) > value) {
        this.pushAlert('顯示值超過下限，請註記異常')
      } else {
        this.removeAlert('顯示值超過下限，請註記異常')
      }
    }
    if (key.substr(3, 2) === 'ma' && !isChecked) {
      if (Number(humi_high) < value) {
        this.pushAlert('最大值超過上限，請註記異常')
      } else {
        this.removeAlert('最大值超過上限，請註記異常')
      }
      if (Number(humi_low) > value) {
        this.pushAlert('最大值超過下限，請註記異常')
      } else {
        this.removeAlert('最大值超過下限，請註記異常')
      }
    }
    if (key.substr(3, 2) === 'mi' && !isChecked) {
      if (Number(humi_high) < value) {
        this.pushAlert('最小值超過上限，請註記異常')
      } else {
        this.removeAlert('最小值超過上限，請註記異常')
      }
      if (Number(humi_low) > value) {
        this.pushAlert('最小值超過下限，請註記異常')
      } else {
        this.removeAlert('最小值超過下限，請註記異常')
      }
    }
  }

  exceptionCheck() {
    let type = this.checkTime()
    let { alertMsg } = this.state
    let isChecked = false
    if (this.state[type + err[0]] === 'Y' || 
        this.state[type + err[1]] === 'Y' || 
        this.state[type + err[2]] === 'Y' || 
        this.state[type + err[3]] === 'Y') {
      isChecked = true
      alertMsg = []
      this.setState({ isChecked: isChecked, alertMsg: alertMsg })
    } else {
      this.setState({ isChecked: isChecked }, () => {
        key.map((item) => {
          this.inputCheck(type + item)
        })
      })
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

  checkboxChange(key, e) {
    let state, value
    state = this.state[key]
    value = state === 'Y' ? 'N' : 'Y'
    this.setState({ [key]: value }, () => (this.exceptionCheck()))
  }

  layoutInput(col) {
    let type = this.checkTime()
    return (
      <tr>
        <td>{col}</td>
        <td colSpan={3}>
          {key.map((item, index) => (
            <Record
              key={index}
              label={keyLabel[index]}
              value={this.state[type + item]}
              onChange={this.inputChange.bind(this, type + item)}
            />
          ))}
        </td>
      </tr>
    )
  }

  layoutCheck() {
    let type = this.checkTime()
    return (
      <tr>
        <td>異常選項</td>
        <td colSpan={3}>
          {err.map((item, index) => (
            <Exception
              key={index}
              label={errLabel[index]}
              value={this.state[type + item]}
              checked={this.state[type + item]}
              onChange={this.checkboxChange.bind(this, type + item)}
            />
          ))}
        </td>
      </tr>
    )
  }

  checkTime() {
    const { rule } = this.state
    if (rule !== undefined) {
      if (operatorHandle(hours, rule.MO_START.cond, Number(rule.MO_START.val)) &&
        operatorHandle(hours, rule.MO_OTHER.cond, Number(rule.MO_OTHER.val))) {
        return 'mo'
      }
      if (operatorHandle(hours, rule.AF_START.cond, Number(rule.AF_START.val)) &&
        operatorHandle(hours, rule.AF_END.cond, Number(rule.AF_END.val))) {
        return 'af'
      }
      if (operatorHandle(hours, rule.EV_START.cond, Number(rule.EV_START.val)) &&
        operatorHandle(hours, rule.EV_END.cond, Number(rule.EV_END.val))) {
        return 'ev'
      }
    }
    return ''
  }

  rmkChange(e) {
    this.setState({ mo_rmk: e.target.value }, () => { this.checkFillTime() })
  }

  openConfirm() {
    this.setState({ confirmShow: true })
  }

  hideConfirm() {
    this.setState({ confirmShow: false })
  }

  onCancel() {
    this.props.onCancel()
  }

  render() {
    const { pointInfo } = this.props
    const {
      alertMsg,
      mach_no, ch_date, humi_high, humi_low,
      isLoading, isChecked, isDeviation, isOverdue,
    } = this.state
    const { mo, af, ev } = this.state
    const isComplete = !(this.state.log_data === null)
    
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
              <td colSpan={4}>
                <span className="title is-4">最溼點溼度記錄表</span>
                <span className="title is-6" style={{ marginLeft: '10px' }}>
                  日期：{today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate()}
                </span>
              </td>
            </tr>
            <tr>
              <td width="120">位置</td>
              <td colSpan={3}>
                <span>{pointInfo.point_name}</span>
                <span style={{ marginLeft: '10px' }}>{pointInfo.point_des}</span>
              </td>
            </tr>
            <tr>
              <td>儀器編號</td><td>{mach_no}</td>
              <td width="120">儀器校期</td><td>{ch_date}</td>
            </tr>
            <tr>
              <td>合格範圍</td><td>{(humi_low !== 0 ? humi_low : '') + " ~ " + (humi_high !== 0 ? humi_high : '') + ' R.H(%)'}</td>
            </tr>
            {this.checkTime() === 'mo' &&
              this.layoutInput('上午記錄')
            }
            {this.checkTime() === 'af' &&
              this.layoutInput('下午記錄(1)')
            }
            {this.checkTime() === 'ev' &&
              this.layoutInput('下午記錄(2)')
            }
            {this.checkTime() === 'mo' &&
              this.layoutCheck('mo')
            }
            {this.checkTime() === 'af' &&
              this.layoutCheck('af')
            }
            {this.checkTime() === 'ev' &&
              this.layoutCheck('ev')
            }
            {this.checkTime() === 'mo' &&
              <tr>
                <td>逾時原因</td>
                <td colSpan={3}>
                  <select className="select"
                    placeholder="請選擇"
                    onChange={this.rmkChange.bind(this)}
                    value={this.state.mo_rmk || ""}
                  >
                    <option value=""></option>
                    <option value="參加集會">參加集會</option>
                    <option value="其它">其它</option>
                  </select>
                </td>
              </tr>
            }
            {this.checkTime() === 'mo' && 
              <Remark value={this.state.mo_urmk} onChange={this.inputChange.bind(this, 'mo_urmk')}/>
            }
            {this.checkTime() === 'af' && 
              <Remark value={this.state.af_urmk} onChange={this.inputChange.bind(this, 'af_urmk')}/>
            }
            {this.checkTime() === 'ev' && 
              <Remark value={this.state.ev_urmk} onChange={this.inputChange.bind(this, 'ev_urmk')}/>
            }
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
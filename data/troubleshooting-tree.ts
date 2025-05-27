import type React from "react"
import {
  AlertTriangle,
  Battery,
  BatteryCharging,
  Cable,
  CreditCard,
  HelpCircle,
  MapPin,
  Power,
  Smartphone,
  Zap,
  Thermometer,
  Clock,
  Car,
  WifiOff,
  ShieldAlert,
  PlugZap,
  Gauge,
  Receipt,
  BadgePercent,
  UserCog,
  KeyRound,
  Compass,
  ParkingCircle,
  Share2,
} from "lucide-react"

// 문제 진단 트리 타입 정의
export type WizardNodeType = "question" | "solution" | "redirect"

export interface WizardNode {
  id: string
  type: WizardNodeType
  title: string
  description?: string
  icon?: React.ComponentType<any>
  options?: WizardOption[]
  solution?: {
    steps: string[]
    additionalInfo?: string
    videoUrl?: string
    imageUrl?: string
    relatedArticles?: {
      title: string
      url: string
    }[]
    vehicleSpecific?: Record<
      string,
      {
        steps: string[]
        additionalInfo?: string
      }
    >
  }
  redirectTo?: string
}

export interface WizardOption {
  id: string
  text: string
  nextNodeId: string
}

// 충전 문제 진단 트리
export const chargingTroubleshootingTree: Record<string, WizardNode> = {
  // 시작 노드
  root: {
    id: "root",
    type: "question",
    title: "어떤 문제를 겪고 계신가요?",
    description: "문제 유형을 선택하시면 단계별로 진단을 도와드립니다.",
    icon: HelpCircle,
    options: [
      { id: "charging", text: "충전이 시작되지 않거나 중단됨", nextNodeId: "charging_issue_type" },
      { id: "payment", text: "결제 관련 문제", nextNodeId: "payment_issue_type" },
      { id: "app", text: "앱 사용 중 문제", nextNodeId: "app_issue_type" },
      { id: "location", text: "충전소 찾기/접근 문제", nextNodeId: "location_issue_type" },
      { id: "account", text: "계정 및 회원 관련 문제", nextNodeId: "account_issue_type" },
      { id: "other", text: "기타 문제", nextNodeId: "contact_support" },
    ],
  },

  // 충전 문제 유형
  charging_issue_type: {
    id: "charging_issue_type",
    type: "question",
    title: "어떤 충전 문제가 발생했나요?",
    description: "가장 가까운 상황을 선택해주세요.",
    icon: BatteryCharging,
    options: [
      { id: "not_start", text: "충전이 시작되지 않음", nextNodeId: "charging_not_start_reason" },
      { id: "interrupted", text: "충전 중 갑자기 중단됨", nextNodeId: "charging_interrupted_reason" },
      { id: "slow", text: "충전 속도가 너무 느림", nextNodeId: "charging_slow_reason" },
      { id: "cable_stuck", text: "충전 케이블이 분리되지 않음", nextNodeId: "cable_stuck_solution" },
      { id: "error_code", text: "오류 코드가 표시됨", nextNodeId: "charging_error_code" },
      { id: "back", text: "이전 단계로 돌아가기", nextNodeId: "root" },
    ],
  },

  // 충전 시작 안됨 - 원인
  charging_not_start_reason: {
    id: "charging_not_start_reason",
    type: "question",
    title: "충전기에 어떤 상태가 표시되나요?",
    description: "충전기 디스플레이나 표시등을 확인해주세요.",
    icon: Power,
    options: [
      { id: "error_code", text: "오류 코드가 표시됨", nextNodeId: "charging_error_code" },
      { id: "no_power", text: "전원이 들어오지 않음", nextNodeId: "charging_no_power_solution" },
      { id: "connection_issue", text: "연결 오류 메시지", nextNodeId: "charging_connection_solution" },
      { id: "payment_issue", text: "결제 관련 메시지", nextNodeId: "charging_payment_solution" },
      { id: "normal", text: "정상 상태로 보임", nextNodeId: "charging_normal_but_not_working" },
      { id: "back", text: "이전 단계로 돌아가기", nextNodeId: "charging_issue_type" },
    ],
  },

  // 충전 중단 - 원인
  charging_interrupted_reason: {
    id: "charging_interrupted_reason",
    type: "question",
    title: "충전이 중단되기 전에 어떤 상황이었나요?",
    description: "가장 가까운 상황을 선택해주세요.",
    icon: AlertTriangle,
    options: [
      { id: "power_outage", text: "충전소 전원이 꺼짐", nextNodeId: "charging_power_outage_solution" },
      { id: "app_disconnect", text: "앱 연결이 끊김", nextNodeId: "charging_app_disconnect_solution" },
      { id: "error_during", text: "오류 메시지 발생", nextNodeId: "charging_error_during_solution" },
      { id: "vehicle_issue", text: "차량에서 중단 메시지", nextNodeId: "charging_vehicle_issue_solution" },
      { id: "unknown", text: "원인을 모르겠음", nextNodeId: "charging_unknown_interruption_solution" },
      { id: "back", text: "이전 단계로 돌아가기", nextNodeId: "charging_issue_type" },
    ],
  },

  // 충전 속도 느림 - 원인
  charging_slow_reason: {
    id: "charging_slow_reason",
    type: "question",
    title: "언제부터 충전 속도가 느려졌나요?",
    description: "충전 속도 저하 상황을 선택해주세요.",
    icon: Zap,
    options: [
      { id: "always_slow", text: "항상 느림", nextNodeId: "charging_always_slow_check" },
      { id: "after_80", text: "배터리 80% 이후", nextNodeId: "charging_after_80_solution" },
      { id: "weather", text: "특정 날씨에만 (덥거나 추울 때)", nextNodeId: "charging_weather_solution" },
      { id: "specific_station", text: "특정 충전소에서만", nextNodeId: "charging_specific_station_solution" },
      { id: "recently", text: "최근에 갑자기 느려짐", nextNodeId: "charging_recently_slow_solution" },
      { id: "back", text: "이전 단계로 돌아가기", nextNodeId: "charging_issue_type" },
    ],
  },

  // 항상 느린 충전 - 추가 확인
  charging_always_slow_check: {
    id: "charging_always_slow_check",
    type: "question",
    title: "충전기와 차량 정보를 확인해주세요",
    description: "충전 속도에 영향을 미치는 요소를 확인합니다.",
    icon: Battery,
    options: [
      { id: "ac_charger", text: "완속 충전기(AC) 사용 중", nextNodeId: "charging_ac_charger_solution" },
      { id: "dc_low_power", text: "저출력 급속 충전기 사용 중", nextNodeId: "charging_dc_low_power_solution" },
      { id: "vehicle_limit", text: "차량 최대 충전 속도 확인 필요", nextNodeId: "charging_vehicle_limit_solution" },
      { id: "shared_charger", text: "다른 차량과 충전기 공유 중", nextNodeId: "charging_shared_charger_solution" },
      { id: "not_sure", text: "잘 모르겠음", nextNodeId: "charging_not_sure_slow_solution" },
      { id: "back", text: "이전 단계로 돌아가기", nextNodeId: "charging_slow_reason" },
    ],
  },

  // 오류 코드 입력
  charging_error_code: {
    id: "charging_error_code",
    type: "question",
    title: "오류 코드를 확인해주세요",
    description: "충전기나 차량에 표시된 오류 코드를 입력하시면 해결 방법을 안내해 드립니다.",
    icon: ShieldAlert,
    options: [
      { id: "e01", text: "E-01 / 통신 오류", nextNodeId: "error_e01_solution" },
      { id: "e02", text: "E-02 / 과전류 감지", nextNodeId: "error_e02_solution" },
      { id: "e03", text: "E-03 / 접지 오류", nextNodeId: "error_e03_solution" },
      { id: "e04", text: "E-04 / 충전기 과열", nextNodeId: "error_e04_solution" },
      { id: "e05", text: "E-05 / 인증 실패", nextNodeId: "error_e05_solution" },
      { id: "other_error", text: "다른 오류 코드", nextNodeId: "error_other_solution" },
      { id: "back", text: "이전 단계로 돌아가기", nextNodeId: "charging_not_start_reason" },
    ],
  },

  // 케이블 분리 안됨 - 해결책
  cable_stuck_solution: {
    id: "cable_stuck_solution",
    type: "solution",
    title: "충전 케이블 분리 문제 해결",
    description: "충전 케이블이 분리되지 않는 문제를 해결하는 방법입니다.",
    icon: Cable,
    solution: {
      steps: [
        "1. 차량이 완전히 잠금 해제되어 있는지 확인하세요.",
        "2. 차량의 충전 중지 버튼을 눌러 충전을 완전히 종료하세요.",
        "3. 차량 키로 잠금/잠금 해제를 다시 시도해보세요.",
        "4. 차량 내부의 충전 포트 잠금 해제 버튼을 찾아 눌러보세요.",
        "5. 앱에서 충전 세션이 완전히 종료되었는지 확인하세요.",
      ],
      additionalInfo:
        "위 방법으로 해결되지 않으면, 차량 제조사의 긴급 서비스나 충전소 운영자에게 연락하세요. 케이블을 강제로 분리하려고 시도하지 마세요.",
      videoUrl: "https://example.com/videos/cable-stuck-solution",
      imageUrl: "/charging-cable-separation-diagram.png",
      relatedArticles: [
        { title: "차종별 충전 케이블 잠금 해제 방법", url: "/help/cable-unlock" },
        { title: "충전 케이블 비상 분리 절차", url: "/help/emergency-cable-removal" },
      ],
      vehicleSpecific: {
        "아이오닉 5": {
          steps: [
            "1. 차량 키로 차량을 잠금 해제하세요.",
            "2. 대시보드의 충전 포트 열기 버튼을 눌러 잠금을 해제하세요.",
            "3. 충전 케이블의 잠금 버튼을 누른 상태에서 케이블을 분리하세요.",
            "4. 위 방법으로 해결되지 않으면, 트렁크 내부의 비상 케이블 해제 레버를 사용하세요.",
          ],
        },
        "테슬라 모델 3": {
          steps: [
            "1. 테슬라 앱에서 충전 중지를 선택하세요.",
            "2. 차량이 잠금 해제되었는지 확인하세요.",
            "3. 충전 케이블 핸들의 버튼을 누른 상태에서 케이블을 분리하세요.",
            "4. 터치스크린에서 충전 포트 열기 옵션을 선택하세요.",
          ],
        },
      },
    },
  },

  // 충전기 전원 없음 - 해결책
  charging_no_power_solution: {
    id: "charging_no_power_solution",
    type: "solution",
    title: "충전기 전원 문제 해결",
    description: "충전기에 전원이 들어오지 않는 문제를 해결하는 방법입니다.",
    icon: Power,
    solution: {
      steps: [
        "1. 충전소 내 다른 충전기도 전원이 들어오지 않는지 확인하세요.",
        "2. 충전소 운영 시간 내인지 확인하세요(일부 충전소는 특정 시간에만 운영).",
        "3. 앱에서 해당 충전소의 운영 상태를 확인하세요.",
        "4. 충전소 관리자나 운영 회사에 전화로 문의하세요.",
        "5. 가까운 다른 충전소를 검색하여 이동하는 것을 고려하세요.",
      ],
      additionalInfo:
        "지역 정전이나 충전소 유지보수로 인한 일시적인 문제일 수 있습니다. 충전소 운영자에게 문의하면 더 정확한 정보를 얻을 수 있습니다.",
      imageUrl: "/charging-station-power-check.png",
    },
  },

  // 배터리 80% 이후 충전 속도 저하 - 해결책
  charging_after_80_solution: {
    id: "charging_after_80_solution",
    type: "solution",
    title: "배터리 80% 이후 충전 속도 저하",
    description: "배터리 보호를 위한 정상적인 현상입니다.",
    icon: Battery,
    solution: {
      steps: [
        "1. 배터리가 80% 이상 충전되면 배터리 보호를 위해 자동으로 충전 속도가 감소합니다.",
        "2. 이는 배터리 수명을 연장하기 위한 정상적인 기능입니다.",
        "3. 급속 충전은 일반적으로 0%에서 80%까지 가장 효율적입니다.",
        "4. 장거리 여행 전 100% 충전이 필요한 경우, 충전 시간이 더 오래 걸릴 수 있음을 감안하세요.",
        "5. 차량 설정에서 충전 한도를 80%로 설정하면 가장 효율적인 충전이 가능합니다.",
      ],
      additionalInfo:
        "대부분의 전기차는 배터리 관리 시스템(BMS)이 자동으로 이 과정을 관리합니다. 이는 고장이 아니라 배터리를 보호하기 위한 정상적인 기능입니다.",
      imageUrl: "/ev-battery-charging-speed.png",
      relatedArticles: [
        { title: "전기차 배터리 수명 연장 팁", url: "/help/battery-life" },
        { title: "충전 속도와 배터리 상태의 관계", url: "/help/charging-speed-battery" },
      ],
    },
  },

  // 날씨 관련 충전 속도 저하 - 해결책
  charging_weather_solution: {
    id: "charging_weather_solution",
    type: "solution",
    title: "날씨 관련 충전 속도 저하",
    description: "극단적인 온도에서 충전 속도가 느려지는 문제를 해결하는 방법입니다.",
    icon: Thermometer,
    solution: {
      steps: [
        "1. 추운 날씨에는 배터리 예열 기능을 사용하세요(가능한 경우).",
        "2. 충전 전 10-15분 동안 차량을 주행하여 배터리 온도를 높이세요.",
        "3. 가능하다면 실내 충전소나 지하 주차장과 같은 온도가 조절된 환경에서 충전하세요.",
        "4. 더운 날씨에는 직사광선을 피하고 그늘진 곳에 주차한 후 충전하세요.",
        "5. 배터리 냉각 시스템이 있는 경우, 충전 전에 차량 냉각을 활성화하세요.",
      ],
      additionalInfo:
        "리튬이온 배터리는 약 20-25°C에서 최적의 성능을 발휘합니다. 극단적인 온도(0°C 이하 또는 40°C 이상)에서는 배터리 보호를 위해 충전 속도가 자동으로 제한됩니다.",
      imageUrl: "/ev-battery-temperature-charge-speed-graph.png",
      relatedArticles: [
        { title: "겨울철 전기차 충전 팁", url: "/help/winter-charging" },
        { title: "여름철 배터리 관리 방법", url: "/help/summer-battery-care" },
      ],
    },
  },

  // 특정 충전소에서만 느린 충전 - 해결책
  charging_specific_station_solution: {
    id: "charging_specific_station_solution",
    type: "solution",
    title: "특정 충전소에서만 느린 충전",
    description: "특정 충전소에서만 충전 속도가 느린 경우 해결 방법입니다.",
    icon: MapPin,
    solution: {
      steps: [
        "1. 해당 충전소의 최대 출력을 확인하세요(kW 단위).",
        "2. 다른 사용자들이 동시에 충전 중인지 확인하세요(전력 분배 가능성).",
        "3. 충전소 운영자에게 충전기 상태를 문의하세요.",
        "4. 다른 충전 커넥터나 충전기를 시도해보세요.",
        "5. 앱에서 해당 충전소의 사용자 리뷰를 확인하여 유사한 문제가 있는지 확인하세요.",
      ],
      additionalInfo:
        "일부 충전소는 여러 충전기가 동일한 전력 공급원을 공유하여 동시 사용 시 출력이 감소할 수 있습니다. 또한 노후된 충전 인프라는 최대 출력을 제공하지 못할 수 있습니다.",
      imageUrl: "/ev-charging-station-power-distribution.png",
    },
  },

  // 최근에 갑자기 느려진 충전 - 해결책
  charging_recently_slow_solution: {
    id: "charging_recently_slow_solution",
    type: "solution",
    title: "최근에 갑자기 느려진 충전",
    description: "최근에 충전 속도가 갑자기 느려진 경우 해결 방법입니다.",
    icon: Clock,
    solution: {
      steps: [
        "1. 차량을 완전히 종료하고 재시작해보세요(전원 리셋).",
        "2. 다른 충전소에서 충전을 시도해보세요.",
        "3. 차량 소프트웨어 업데이트가 있는지 확인하세요.",
        "4. 배터리 상태 진단을 실행하세요(차량 설정에서 가능한 경우).",
        "5. 문제가 지속되면 서비스 센터를 방문하여 배터리 상태를 점검받으세요.",
      ],
      additionalInfo:
        "최근 소프트웨어 업데이트 후 충전 속도가 변경될 수 있습니다. 이는 배터리 보호를 위한 조치일 수 있으며, 일부 업데이트는 배터리 수명을 연장하기 위해 충전 프로필을 조정합니다.",
      imageUrl: "/electric-vehicle-battery-diagnosis.png",
      relatedArticles: [
        { title: "배터리 성능 저하 징후와 대처 방법", url: "/help/battery-degradation" },
        { title: "전기차 소프트웨어 업데이트와 충전 변화", url: "/help/software-updates" },
      ],
    },
  },

  // 완속 충전기 사용 - 해결책
  charging_ac_charger_solution: {
    id: "charging_ac_charger_solution",
    type: "solution",
    title: "완속 충전기(AC) 사용 시 충전 속도",
    description: "완속 충전기 사용 시 충전 속도에 대한 정보입니다.",
    icon: PlugZap,
    solution: {
      steps: [
        "1. 완속 충전기(AC)는 일반적으로 3.3kW~11kW의 출력을 제공합니다.",
        "2. 차량의 내장 충전기(OBC) 용량이 충전 속도를 제한합니다.",
        "3. 완속 충전은 일반적으로 배터리 용량에 따라 4~10시간이 소요됩니다.",
        "4. 더 빠른 충전이 필요하면 급속 충전기(DC)를 이용하세요.",
        "5. 완속 충전은 배터리에 부담이 적어 일상적인 충전에 적합합니다.",
      ],
      additionalInfo:
        "완속 충전기는 느리지만 배터리 수명에 더 좋으며 일반적으로 가정용 충전이나 장시간 주차 시 사용하기에 적합합니다. 급속 충전이 필요한 경우 DC 급속 충전소를 이용하세요.",
      imageUrl: "/ac-dc-charger-comparison.png",
      relatedArticles: [
        { title: "AC와 DC 충전의 차이점", url: "/help/ac-dc-charging" },
        { title: "가정용 충전기 설치 가이드", url: "/help/home-charger-installation" },
      ],
    },
  },

  // 저출력 급속 충전기 - 해결책
  charging_dc_low_power_solution: {
    id: "charging_dc_low_power_solution",
    type: "solution",
    title: "저출력 급속 충전기 사용 시 충전 속도",
    description: "저출력 급속 충전기 사용 시 충전 속도에 대한 정보입니다.",
    icon: Gauge,
    solution: {
      steps: [
        "1. 급속 충전기의 최대 출력을 확인하세요(50kW, 100kW, 350kW 등).",
        "2. 차량의 최대 충전 용량과 비교하세요.",
        "3. 50kW 충전기는 고출력 충전기(150kW 이상)보다 충전 시간이 2~3배 더 소요됩니다.",
        "4. 앱에서 고출력 충전기 위치를 검색하여 더 빠른 충전을 시도하세요.",
        "5. 충전 계획 시 충전기 출력에 따른 소요 시간을 고려하세요.",
      ],
      additionalInfo:
        "모든 급속 충전기가 동일하지 않습니다. 50kW 충전기는 '급속'으로 분류되지만, 최신 고출력 충전기(150kW~350kW)보다 훨씬 느립니다. 차량이 고출력 충전을 지원하는 경우, 고출력 충전기를 이용하면 충전 시간을 크게 단축할 수 있습니다.",
      imageUrl: "/fast-chargers-comparison.png",
    },
  },

  // 차량 충전 속도 제한 - 해결책
  charging_vehicle_limit_solution: {
    id: "charging_vehicle_limit_solution",
    type: "solution",
    title: "차량 최대 충전 속도 제한",
    description: "차량의 최대 충전 속도 제한에 대한 정보입니다.",
    icon: Car,
    solution: {
      steps: [
        "1. 차량 매뉴얼에서 최대 충전 용량(kW)을 확인하세요.",
        "2. 차량의 최대 충전 속도보다 높은 출력의 충전기를 사용해도 차량 한도 이상으로 충전되지 않습니다.",
        "3. 차량 제조사 앱이나 웹사이트에서 모델별 충전 속도를 확인하세요.",
        "4. 소프트웨어 업데이트로 일부 차량은 충전 속도가 향상될 수 있습니다.",
        "5. 배터리 상태와 온도도 최대 충전 속도에 영향을 미칩니다.",
      ],
      additionalInfo:
        "차량마다 지원하는 최대 충전 속도가 다릅니다. 예를 들어, 일부 차량은 50kW만 지원하는 반면, 다른 차량은 150kW 이상을 지원합니다. 350kW 충전기를 사용해도 차량이 100kW만 지원한다면 100kW 이상으로 충전되지 않습니다.",
      imageUrl: "/electric-vehicle-charging-speed-comparison.png",
      relatedArticles: [
        { title: "전기차 모델별 충전 속도 비교", url: "/help/ev-charging-speed-comparison" },
        { title: "충전 속도에 영향을 미치는 요소들", url: "/help/charging-speed-factors" },
      ],
    },
  },

  // 충전기 공유 - 해결책
  charging_shared_charger_solution: {
    id: "charging_shared_charger_solution",
    type: "solution",
    title: "충전기 공유 시 충전 속도 저하",
    description: "다른 차량과 충전기를 공유할 때 충전 속도 저하에 대한 정보입니다.",
    icon: Share2,
    solution: {
      steps: [
        "1. 일부 충전소는 여러 충전기가 전력을 공유하여 동시 사용 시 출력이 감소합니다.",
        "2. 가능하면 다른 차량이 사용하지 않는 시간대에 충전하세요.",
        "3. 충전소 정보에서 '전력 공유' 여부를 확인하세요.",
        "4. 앱에서 '전용' 또는 '독립 전원' 충전기를 검색하세요.",
        "5. 충전 속도가 중요한 경우, 다른 충전소로 이동을 고려하세요.",
      ],
      additionalInfo:
        "일부 충전소는 비용 절감을 위해 여러 충전기가 하나의 전력 공급 장치를 공유합니다. 이런 경우 동시에 여러 차량이 충전하면 각 차량의 충전 속도가 감소합니다. 특히 쇼핑몰이나 주차장의 충전소에서 흔히 발생합니다.",
      imageUrl: "/charging-station-power-sharing-diagram.png",
    },
  },

  // 결제 관련 문제 유형
  payment_issue_type: {
    id: "payment_issue_type",
    type: "question",
    title: "어떤 결제 문제가 발생했나요?",
    description: "가장 가까운 상황을 선택해주세요.",
    icon: CreditCard,
    options: [
      { id: "payment_failed", text: "결제가 실패함", nextNodeId: "payment_failed_reason" },
      { id: "double_payment", text: "이중 결제됨", nextNodeId: "double_payment_solution" },
      { id: "receipt", text: "영수증 발급 필요", nextNodeId: "receipt_solution" },
      { id: "discount", text: "할인이 적용되지 않음", nextNodeId: "discount_not_applied_solution" },
      { id: "back", text: "이전 단계로 돌아가기", nextNodeId: "root" },
    ],
  },

  // 결제 실패 - 원인
  payment_failed_reason: {
    id: "payment_failed_reason",
    type: "question",
    title: "어떤 결제 실패 메시지가 표시되나요?",
    description: "결제 실패 상황을 선택해주세요.",
    icon: CreditCard,
    options: [
      { id: "card_declined", text: "카드가 거절됨", nextNodeId: "card_declined_solution" },
      { id: "insufficient_balance", text: "잔액 부족", nextNodeId: "insufficient_balance_solution" },
      { id: "connection_error", text: "연결 오류", nextNodeId: "payment_connection_error_solution" },
      { id: "invalid_card", text: "유효하지 않은 카드 정보", nextNodeId: "invalid_card_solution" },
      { id: "unknown_error", text: "알 수 없는 오류", nextNodeId: "payment_unknown_error_solution" },
      { id: "back", text: "이전 단계로 돌아가기", nextNodeId: "payment_issue_type" },
    ],
  },

  // 이중 결제 - 해결책
  double_payment_solution: {
    id: "double_payment_solution",
    type: "solution",
    title: "이중 결제 문제 해결",
    description: "이중 결제가 발생한 경우 해결 방법입니다.",
    icon: CreditCard,
    solution: {
      steps: [
        "1. 앱의 '충전 이력'에서 해당 거래를 확인하세요.",
        "2. 실제로 이중 결제된 경우, 자동으로 3-5일 내에 환불이 진행됩니다.",
        "3. 환불이 진행되지 않는 경우, 앱의 '결제 내역'에서 '환불 요청' 버튼을 사용하세요.",
        "4. 거래 ID와 영수증을 준비해 두세요.",
        "5. 7일 이상 환불이 처리되지 않으면 고객센터에 문의하세요.",
      ],
      additionalInfo:
        "이중 결제는 네트워크 지연이나 결제 시스템 오류로 인해 발생할 수 있습니다. 대부분의 경우 자동으로 감지되어 환불이 진행됩니다.",
      imageUrl: "/double-payment-refund-request.png",
      relatedArticles: [
        { title: "결제 오류 및 환불 처리 가이드", url: "/help/payment-refunds" },
        { title: "충전 결제 내역 확인 방법", url: "/help/payment-history" },
      ],
    },
  },

  // 영수증 발급 - 해결책
  receipt_solution: {
    id: "receipt_solution",
    type: "solution",
    title: "영수증 발급 방법",
    description: "충전 영수증을 발급받는 방법입니다.",
    icon: Receipt,
    solution: {
      steps: [
        "1. 앱의 '충전 이력' 메뉴로 이동하세요.",
        "2. 영수증이 필요한 충전 내역을 선택하세요.",
        "3. '영수증 발급' 버튼을 탭하세요.",
        "4. 개인용 또는 사업자용 영수증 중 필요한 유형을 선택하세요.",
        "5. 이메일 주소를 입력하여 영수증을 받거나, PDF로 저장할 수 있습니다.",
      ],
      additionalInfo:
        "영수증은 충전 완료 후 최대 5년간 발급 가능합니다. 사업자 지출 증빙용 영수증이 필요한 경우, 사업자 정보를 미리 앱에 등록해두면 편리합니다.",
      imageUrl: "/ev-charging-receipt.png",
      relatedArticles: [
        { title: "전기차 충전 비용 세금 공제 가이드", url: "/help/ev-tax-deduction" },
        { title: "사업자 영수증 등록 방법", url: "/help/business-receipt-registration" },
      ],
    },
  },

  // 할인 미적용 - 해결책
  discount_not_applied_solution: {
    id: "discount_not_applied_solution",
    type: "solution",
    title: "할인이 적용되지 않는 문제 해결",
    description: "충전 시 할인이 적용되지 않는 문제를 해결하는 방법입니다.",
    icon: BadgePercent,
    solution: {
      steps: [
        "1. 앱에서 할인 프로그램 가입 상태를 확인하세요.",
        "2. 멤버십 등급과 혜택이 유효한지 확인하세요.",
        "3. 해당 충전소가 할인 프로그램 대상인지 확인하세요(일부 충전소는 제외될 수 있음).",
        "4. 결제 카드가 할인 프로그램에 등록된 카드인지 확인하세요.",
        "5. 월간 할인 한도를 초과했는지 확인하세요.",
      ],
      additionalInfo:
        "일부 할인 프로그램은 특정 시간대나 특정 충전소에서만 적용됩니다. 또한 프로모션 할인은 기간이 제한되어 있을 수 있으니 앱의 '이벤트' 섹션에서 현재 진행 중인 프로모션을 확인하세요.",
      imageUrl: "/placeholder.svg?key=avtsz",
    },
  },

  // 앱 관련 문제 유형
  app_issue_type: {
    id: "app_issue_type",
    type: "question",
    title: "어떤 앱 문제가 발생했나요?",
    description: "가장 가까운 상황을 선택해주세요.",
    icon: Smartphone,
    options: [
      { id: "app_crash", text: "앱이 자꾸 종료됨", nextNodeId: "app_crash_solution" },
      { id: "loading_issue", text: "정보가 로딩되지 않음", nextNodeId: "app_loading_issue_solution" },
      { id: "login_issue", text: "로그인 문제", nextNodeId: "app_login_issue_solution" },
      { id: "notification", text: "알림이 오지 않음", nextNodeId: "app_notification_solution" },
      { id: "map_issue", text: "지도나 충전소 정보 오류", nextNodeId: "app_map_issue_solution" },
      { id: "back", text: "이전 단계로 돌아가기", nextNodeId: "root" },
    ],
  },

  // 앱 충돌 - 해결책
  app_crash_solution: {
    id: "app_crash_solution",
    type: "solution",
    title: "앱 종료 문제 해결",
    description: "앱이 계속 종료되는 문제를 해결하는 방법입니다.",
    icon: Smartphone,
    solution: {
      steps: [
        "1. 앱을 최신 버전으로 업데이트하세요.",
        "2. 기기를 재부팅하세요.",
        "3. 앱 캐시를 삭제하세요(설정 > 앱 > 전기차 충전 앱 > 저장공간 > 캐시 삭제).",
        "4. 앱을 삭제하고 다시 설치해 보세요.",
        "5. 기기의 저장 공간이 충분한지 확인하세요.",
      ],
      additionalInfo:
        "문제가 지속되면 앱 설정의 '오류 보고' 기능을 통해 로그를 전송해 주세요. 기기 모델과 운영체제 버전을 함께 알려주시면 더 빠른 해결에 도움이 됩니다.",
      imageUrl: "/app-cache-deletion.png",
      relatedArticles: [
        { title: "앱 오류 해결을 위한 일반적인 팁", url: "/help/app-troubleshooting" },
        { title: "앱 로그 전송 방법", url: "/help/app-logs" },
      ],
    },
  },

  // 앱 로딩 문제 - 해결책
  app_loading_issue_solution: {
    id: "app_loading_issue_solution",
    type: "solution",
    title: "앱 로딩 문제 해결",
    description: "앱에서 정보가 로딩되지 않는 문제를 해결하는 방법입니다.",
    icon: WifiOff,
    solution: {
      steps: [
        "1. 인터넷 연결 상태를 확인하세요.",
        "2. 모바일 데이터나 Wi-Fi를 껐다가 다시 켜보세요.",
        "3. 앱을 완전히 종료하고 다시 실행해보세요.",
        "4. 기기의 날짜와 시간이 정확한지 확인하세요.",
        "5. 앱 캐시를 삭제하고 다시 시도해보세요.",
      ],
      additionalInfo:
        "서버 점검이나 일시적인 서비스 중단으로 인해 발생할 수 있습니다. 잠시 후 다시 시도하거나, 공식 SNS 채널에서 서비스 상태를 확인해보세요.",
      imageUrl: "/placeholder.svg?height=300&width=500&query=모바일 앱 네트워크 설정 화면",
    },
  },

  // 계정 관련 문제 유형
  account_issue_type: {
    id: "account_issue_type",
    type: "question",
    title: "어떤 계정 문제가 발생했나요?",
    description: "가장 가까운 상황을 선택해주세요.",
    icon: UserCog,
    options: [
      { id: "password_reset", text: "비밀번호 재설정", nextNodeId: "password_reset_solution" },
      { id: "account_locked", text: "계정이 잠김", nextNodeId: "account_locked_solution" },
      { id: "membership_issue", text: "멤버십 혜택 문제", nextNodeId: "membership_issue_solution" },
      { id: "profile_update", text: "프로필 정보 변경", nextNodeId: "profile_update_solution" },
      { id: "back", text: "이전 단계로 돌아가기", nextNodeId: "root" },
    ],
  },

  // 비밀번호 재설정 - 해결책
  password_reset_solution: {
    id: "password_reset_solution",
    type: "solution",
    title: "비밀번호 재설정 방법",
    description: "계정 비밀번호를 재설정하는 방법입니다.",
    icon: KeyRound,
    solution: {
      steps: [
        "1. 로그인 화면에서 '비밀번호 찾기' 또는 '비밀번호 재설정'을 탭하세요.",
        "2. 가입 시 등록한 이메일 주소를 입력하세요.",
        "3. 이메일로 받은 인증 코드를 입력하거나 링크를 클릭하세요.",
        "4. 새 비밀번호를 설정하세요(영문, 숫자, 특수문자 조합 8자 이상 권장).",
        "5. 새 비밀번호로 로그인하세요.",
      ],
      additionalInfo:
        "이메일을 받지 못한 경우 스팸 폴더를 확인하세요. 등록된 이메일에 접근할 수 없는 경우, 고객센터에 문의하여 본인 확인 후 이메일을 변경할 수 있습니다.",
      imageUrl: "/placeholder.svg?height=300&width=500&query=비밀번호 재설정 화면",
    },
  },

  // 충전소 찾기/접근 문제 유형
  location_issue_type: {
    id: "location_issue_type",
    type: "question",
    title: "어떤 충전소 관련 문제가 발생했나요?",
    description: "가장 가까운 상황을 선택해주세요.",
    icon: MapPin,
    options: [
      { id: "find_station", text: "충전소를 찾을 수 없음", nextNodeId: "find_station_solution" },
      { id: "incorrect_info", text: "충전소 정보가 실제와 다름", nextNodeId: "incorrect_info_solution" },
      { id: "navigation", text: "내비게이션 안내 문제", nextNodeId: "navigation_issue_solution" },
      { id: "access_restricted", text: "충전소 접근이 제한됨", nextNodeId: "access_restricted_solution" },
      { id: "back", text: "이전 단계로 돌아가기", nextNodeId: "root" },
    ],
  },

  // 충전소 찾기 문제 - 해결책
  find_station_solution: {
    id: "find_station_solution",
    type: "solution",
    title: "충전소 찾기 문제 해결",
    description: "충전소를 찾을 수 없는 문제를 해결하는 방법입니다.",
    icon: MapPin,
    solution: {
      steps: [
        "1. 앱에서 위치 서비스가 활성화되어 있는지 확인하세요.",
        "2. 앱을 최신 버전으로 업데이트하세요.",
        "3. 검색 반경을 넓혀보세요.",
        "4. 필터 설정을 확인하세요(특정 커넥터 타입만 검색 중일 수 있음).",
        "5. 인터넷 연결 상태를 확인하세요.",
      ],
      additionalInfo:
        "일부 지역에서는 충전소가 제한적일 수 있습니다. '모든 충전소 표시' 옵션을 활성화하면 더 많은 충전소를 볼 수 있습니다.",
      imageUrl: "/placeholder.svg?height=300&width=500&query=충전소 검색 필터 설정 화면",
      relatedArticles: [
        { title: "충전소 필터 활용 가이드", url: "/help/station-filters" },
        { title: "오프라인 충전소 지도 사용법", url: "/help/offline-maps" },
      ],
    },
  },

  // 충전소 정보 오류 - 해결책
  incorrect_info_solution: {
    id: "incorrect_info_solution",
    type: "solution",
    title: "충전소 정보 오류 신고",
    description: "충전소 정보가 실제와 다른 경우 해결 방법입니다.",
    icon: Compass,
    solution: {
      steps: [
        "1. 앱에서 해당 충전소 정보 페이지로 이동하세요.",
        "2. '정보 오류 신고' 또는 '피드백' 버튼을 탭하세요.",
        "3. 잘못된 정보와 실제 정보를 상세히 기록하세요.",
        "4. 가능하다면 현장 사진을 첨부하세요.",
        "5. 제출 후 검토 및 업데이트까지 일정 시간이 소요됩니다.",
      ],
      additionalInfo:
        "충전소 정보는 운영사로부터 제공받거나 사용자 피드백을 통해 업데이트됩니다. 정확한 정보 제공에 협조해 주셔서 감사합니다.",
      imageUrl: "/placeholder.svg?height=300&width=500&query=충전소 정보 오류 신고 화면",
    },
  },

  // 내비게이션 문제 - 해결책
  navigation_issue_solution: {
    id: "navigation_issue_solution",
    type: "solution",
    title: "내비게이션 안내 문제 해결",
    description: "충전소 내비게이션 안내에 문제가 있는 경우 해결 방법입니다.",
    icon: Compass,
    solution: {
      steps: [
        "1. 앱의 위치 권한이 '항상 허용'으로 설정되어 있는지 확인하세요.",
        "2. 기기의 GPS 신호가 양호한지 확인하세요.",
        "3. 다른 내비게이션 앱으로 안내를 시도해보세요.",
        "4. 충전소 주소를 수동으로 복사하여 지도 앱에 입력해보세요.",
        "5. 앱을 최신 버전으로 업데이트하세요.",
      ],
      additionalInfo:
        "일부 충전소는 정확한 GPS 좌표가 아닌 주소 기반으로 등록되어 있어 약간의 오차가 있을 수 있습니다. 충전소가 건물 내부나 지하에 있는 경우 추가 안내가 필요할 수 있습니다.",
      imageUrl: "/placeholder.svg?height=300&width=500&query=내비게이션 앱 연동 화면",
    },
  },

  // 충전소 접근 제한 - 해결책
  access_restricted_solution: {
    id: "access_restricted_solution",
    type: "solution",
    title: "충전소 접근 제한 문제 해결",
    description: "충전소 접근이 제한되는 경우 해결 방법입니다.",
    icon: ParkingCircle,
    solution: {
      steps: [
        "1. 충전소 운영 시간을 확인하세요(일부 충전소는 24시간 운영하지 않음).",
        "2. 해당 충전소가 특정 회원이나 차량만 이용 가능한지 확인하세요.",
        "3. 건물 내부 충전소의 경우, 건물 출입 방법을 앱 상세 정보에서 확인하세요.",
        "4. 주차 요금이 별도로 부과되는지 확인하세요.",
        "5. 접근이 어려운 경우, 다른 충전소를 검색하여 이용하세요.",
      ],
      additionalInfo:
        "일부 충전소는 아파트 단지, 회사 주차장, 호텔 등 접근이 제한된 곳에 위치할 수 있습니다. 앱의 충전소 상세 정보에서 '접근 정보'를 확인하면 도움이 됩니다.",
      imageUrl: "/placeholder.svg?height=300&width=500&query=충전소 접근 정보 화면",
      relatedArticles: [
        { title: "비공개 충전소 이용 가이드", url: "/help/private-stations" },
        { title: "충전소 유형별 접근 방법", url: "/help/station-access" },
      ],
    },
  },

  // 고객 지원 연결
  contact_support: {
    id: "contact_support",
    type: "redirect",
    title: "고객 지원 연결",
    description: "더 자세한 도움이 필요하시면 고객 지원팀에 연결해 드리겠습니다.",
    icon: HelpCircle,
    redirectTo: "support",
  },

  // 오류 코드 해결책 (일부 예시)
  error_e01_solution: {
    id: "error_e01_solution",
    type: "solution",
    title: "E-01 통신 오류 해결",
    description: "충전기와 차량 간 통신 오류(E-01)를 해결하는 방법입니다.",
    icon: WifiOff,
    solution: {
      steps: [
        "1. 충전 케이블을 분리하고 다시 연결해보세요.",
        "2. 차량의 시동을 끄고 다시 켜보세요.",
        "3. 다른 충전 케이블이나 충전기를 사용해보세요.",
        "4. 차량의 충전 포트에 이물질이 없는지 확인하세요.",
        "5. 문제가 지속되면 충전소 운영자에게 연락하세요.",
      ],
      additionalInfo:
        "E-01 오류는 충전기와 차량 간의 통신 문제를 나타냅니다. 케이블 접촉 불량, 충전 포트 손상, 또는 충전기 내부 통신 모듈 문제일 수 있습니다.",
      imageUrl: "/placeholder.svg?height=300&width=500&query=충전 케이블 연결 점검",
    },
  },

  error_e02_solution: {
    id: "error_e02_solution",
    type: "solution",
    title: "E-02 과전류 감지 오류 해결",
    description: "충전 중 과전류 감지(E-02) 오류를 해결하는 방법입니다.",
    icon: AlertTriangle,
    solution: {
      steps: [
        "1. 충전을 중단하고 케이블을 분리하세요.",
        "2. 차량과 충전기를 모두 재시작하세요.",
        "3. 다른 충전기를 사용해보세요.",
        "4. 차량에 다른 전기 장치(히터, 에어컨 등)가 작동 중이면 끄고 시도해보세요.",
        "5. 문제가 지속되면 차량 서비스 센터에 문의하세요.",
      ],
      additionalInfo:
        "E-02 오류는 안전을 위해 과전류가 감지되면 충전을 중단하는 보호 기능입니다. 차량 배터리 관리 시스템이나 충전기의 전류 센서 문제일 수 있습니다.",
      imageUrl: "/placeholder.svg?height=300&width=500&query=전기차 충전 오류 E-02",
    },
  },
}

// 기존 chargingTroubleshootingTree를 troubleshootingTree로도 export
export const troubleshootingTree = chargingTroubleshootingTree

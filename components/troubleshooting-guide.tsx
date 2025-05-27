"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Calendar,
  Car,
  CreditCard,
  HelpCircle,
  MapPin,
  Smartphone,
  User,
  Zap,
} from "lucide-react"
import { TroubleshootingVisualGuide } from "./troubleshooting-visual-guide"
import { TroubleshootingSearch } from "./troubleshooting-search"

// 문제 해결 가이드 데이터
const troubleshootingData = {
  charging: [
    {
      id: "charging-1",
      question: "충전이 시작되지 않아요",
      answer: `다음 단계를 시도해 보세요:
      
1. 충전 케이블이 차량과 충전기에 완전히 연결되었는지 확인하세요.
2. 충전기 디스플레이에 오류 메시지가 있는지 확인하세요.
3. 앱에서 충전 시작 버튼을 다시 눌러보세요.
4. 다른 충전 커넥터를 사용해 보세요.
5. 차량의 충전 포트를 재설정하세요 (차량 매뉴얼 참조).

여전히 문제가 해결되지 않으면 아래의 '추가 도움 요청' 버튼을 눌러주세요.`,
      videoUrl: "https://example.com/videos/charging-troubleshooting",
    },
    {
      id: "charging-2",
      question: "충전 중 갑자기 중단됐어요",
      answer: `충전이 중단된 경우 다음을 확인해 보세요:
      
1. 앱에서 충전 상태를 확인하세요 - 결제 문제로 중단되었을 수 있습니다.
2. 충전기 디스플레이에 오류 코드가 있는지 확인하세요.
3. 케이블 연결 상태를 확인하고 필요시 다시 연결하세요.
4. 충전을 재시작해 보세요.
5. 다른 충전기를 사용해 보세요.

충전기 오류 코드가 표시되면 코드를 메모하고 아래의 '추가 도움 요청' 버튼을 눌러주세요.`,
      videoUrl: "https://example.com/videos/charging-interruption",
    },
    {
      id: "charging-3",
      question: "충전 속도가 너무 느려요",
      answer: `충전 속도가 예상보다 느린 경우 다음 요인을 고려해 보세요:
      
1. 차량 배터리 상태: 배터리가 80% 이상 충전되면 자동으로 충전 속도가 감소합니다.
2. 충전기 공유: 다른 차량과 충전기를 공유하는 경우 속도가 감소할 수 있습니다.
3. 배터리 온도: 배터리가 너무 뜨겁거나 차가우면 충전 속도가 제한됩니다.
4. 충전기 용량: 사용 중인 충전기의 최대 출력을 확인하세요.
5. 차량 설정: 차량의 충전 설정을 확인하세요.

차량이 지원하는 최대 충전 속도와 충전기 용량이 일치하는지 확인하세요.`,
      videoUrl: "https://example.com/videos/charging-speed",
    },
    {
      id: "charging-4",
      question: "충전 케이블이 분리되지 않아요",
      answer: `충전 케이블이 분리되지 않는 경우 다음 단계를 시도해 보세요:
      
1. 차량이 잠금 해제되어 있는지 확인하세요.
2. 앱에서 충전 세션이 종료되었는지 확인하세요.
3. 차량의 충전 해제 버튼을 눌러보세요(대부분 키 리모컨에 있거나 차량 내부에 있습니다).
4. 차량을 다시 잠근 후 잠금 해제해 보세요.
5. 차량의 전원을 껐다가 다시 켜보세요.

위 방법으로도 해결되지 않으면 차량 제조사의 긴급 서비스나 충전소 운영자에게 연락하세요.`,
      videoUrl: "https://example.com/videos/cable-stuck",
    },
    {
      id: "charging-5",
      question: "충전기에 접근할 수 없어요",
      answer: `충전기에 접근할 수 없는 경우 다음을 확인해 보세요:
      
1. 충전소가 영업 시간 내인지 확인하세요(일부 충전소는 특정 시간에만 이용 가능).
2. 충전소가 개인 소유지에 있는 경우, 접근 권한이 필요할 수 있습니다.
3. 앱에서 충전소 상태를 확인하세요 - 유지보수 중일 수 있습니다.
4. 다른 차량이 충전기를 막고 있는 경우, 충전소 관리자에게 연락하세요.
5. 주변에 다른 충전소를 검색해 보세요.

충전소 접근 문제가 지속되면 충전소 운영자에게 직접 문의하세요.`,
      videoUrl: "https://example.com/videos/station-access",
    },
  ],
  payment: [
    {
      id: "payment-1",
      question: "결제가 실패했어요",
      answer: `결제 실패 시 다음 단계를 시도해 보세요:
      
1. 등록된 카드 정보가 최신 상태인지 확인하세요.
2. 카드 잔액이 충분한지 확인하세요.
3. 앱에서 로그아웃 후 다시 로그인해 보세요.
4. 다른 결제 수단을 등록하고 시도해 보세요.
5. 네트워크 연결 상태를 확인하세요.

계속해서 문제가 발생하면 카드사에 문의하거나 아래의 '추가 도움 요청' 버튼을 눌러주세요.`,
      videoUrl: "https://example.com/videos/payment-issues",
    },
    {
      id: "payment-2",
      question: "이중 결제가 됐어요",
      answer: `이중 결제가 발생한 경우:
      
1. 앱의 '충전 이력'에서 해당 거래를 확인하세요.
2. 실제로 이중 결제된 경우, 자동으로 3-5일 내에 환불이 진행됩니다.
3. 환불이 진행되지 않는 경우, 앱의 '결제 내역'에서 '환불 요청' 버튼을 사용하세요.
4. 거래 ID와 영수증을 준비해 두세요.

7일 이상 환불이 처리되지 않으면 아래의 '추가 도움 요청' 버튼을 눌러주세요.`,
      videoUrl: "https://example.com/videos/double-payment",
    },
    {
      id: "payment-3",
      question: "영수증이 필요해요",
      answer: `충전 영수증을 발급받는 방법:
      
1. 앱에 로그인 후 '충전 이력'으로 이동하세요.
2. 영수증이 필요한 충전 내역을 선택하세요.
3. '영수증 보기' 버튼을 클릭하세요.
4. 영수증을 PDF로 다운로드하거나 이메일로 전송할 수 있습니다.
5. 사업자용 영수증(세금계산서)이 필요한 경우 '세금계산서 신청' 버튼을 사용하세요.

90일이 지난 충전 내역의 영수증이 필요한 경우 고객센터로 문의하세요.`,
      videoUrl: "https://example.com/videos/receipts",
    },
    {
      id: "payment-4",
      question: "멤버십 할인이 적용되지 않았어요",
      answer: `멤버십 할인이 적용되지 않은 경우:
      
1. 멤버십 상태가 유효한지 '내 멤버십' 메뉴에서 확인하세요.
2. 해당 충전소가 멤버십 할인 대상인지 확인하세요(일부 파트너사 충전소만 적용).
3. 멤버십 카드가 충전 전에 인증되었는지 확인하세요.
4. 앱에서 로그아웃 후 다시 로그인해 보세요.
5. 충전 내역에서 '할인 미적용 신고' 기능을 사용하세요.

할인 미적용 신고 후 3일 내에 확인 후 차액이 환불됩니다.`,
      videoUrl: "https://example.com/videos/membership-discount",
    },
  ],
  account: [
    {
      id: "account-1",
      question: "비밀번호를 잊어버렸어요",
      answer: `비밀번호 재설정 방법:
      
1. 로그인 화면에서 '비밀번호 찾기'를 선택하세요.
2. 가입 시 등록한 이메일 주소를 입력하세요.
3. 이메일로 받은 링크를 클릭하여 새 비밀번호를 설정하세요.
4. 새 비밀번호는 최소 8자 이상, 숫자와 특수문자를 포함해야 합니다.

이메일을 받지 못했다면 스팸 폴더를 확인하거나, 다른 이메일 주소로 가입했을 수 있습니다.`,
      videoUrl: "https://example.com/videos/password-reset",
    },
    {
      id: "account-2",
      question: "회원 정보를 변경하고 싶어요",
      answer: `회원 정보 변경 방법:
      
1. 앱에 로그인 후 '마이페이지'로 이동하세요.
2. '회원 정보 관리'를 선택하세요.
3. 변경하려는 정보를 수정하세요.
4. 일부 정보(이름, 생년월일 등)는 고객센터를 통해서만 변경 가능합니다.
5. '저장' 버튼을 눌러 변경사항을 적용하세요.

본인 인증이 필요한 정보 변경은 추가 인증 절차가 필요할 수 있습니다.`,
      videoUrl: "https://example.com/videos/account-management",
    },
    {
      id: "account-3",
      question: "계정을 삭제하고 싶어요",
      answer: `계정 삭제 방법:
      
1. 앱에 로그인 후 '마이페이지'로 이동하세요.
2. '설정'을 선택한 후 '회원 탈퇴'를 선택하세요.
3. 탈퇴 사유를 선택하고 비밀번호를 입력하세요.
4. 미사용 충전 크레딧이나 포인트가 있다면 소멸됨을 확인하세요.
5. '탈퇴 확인' 버튼을 눌러 진행하세요.

탈퇴 후 30일 동안은 재가입이 제한되며, 개인정보는 관련 법률에 따라 일정 기간 보관됩니다.`,
      videoUrl: "https://example.com/videos/account-deletion",
    },
    {
      id: "account-4",
      question: "다른 기기에서 로그인했어요",
      answer: `다른 기기에서의 로그인이 감지된 경우:
      
1. 즉시 비밀번호를 변경하세요.
2. '마이페이지' > '설정' > '로그인 기기 관리'에서 모든 기기에서 로그아웃할 수 있습니다.
3. 결제 정보가 저장되어 있다면 카드 정보를 확인하세요.
4. 최근 충전 내역에 본인이 이용하지 않은 내역이 있는지 확인하세요.
5. 의심스러운 활동이 있다면 즉시 고객센터에 신고하세요.

계정 보안을 위해 정기적으로 비밀번호를 변경하고 2단계 인증을 활성화하는 것이 좋습니다.`,
      videoUrl: "https://example.com/videos/account-security",
    },
  ],
  location: [
    {
      id: "location-1",
      question: "가까운 충전소를 찾고 싶어요",
      answer: `가까운 충전소 찾는 방법:
      
1. 앱 메인 화면에서 '주변 충전소 찾기'를 선택하세요.
2. 현재 위치 기반으로 가까운 충전소가 표시됩니다.
3. 필터를 사용하여 급속/완속, 커넥터 타입, 이용 가능 여부 등으로 검색할 수 있습니다.
4. 충전소를 선택하면 상세 정보, 실시간 이용 현황, 길 안내 옵션을 볼 수 있습니다.
5. '즐겨찾기'로 자주 가는 충전소를 저장할 수 있습니다.

특정 지역의 충전소를 찾으려면 검색창에 지역명이나 주소를 입력하세요.`,
      videoUrl: "https://example.com/videos/find-stations",
    },
    {
      id: "location-2",
      question: "충전소 정보가 실제와 다릅니다",
      answer: `충전소 정보 불일치 신고 방법:
      
1. 해당 충전소 상세 페이지로 이동하세요.
2. 페이지 하단의 '정보 수정 요청' 버튼을 선택하세요.
3. 실제와 다른 정보를 선택하고 올바른 정보를 입력하세요.
4. 가능하다면 사진 증거를 첨부하세요.
5. '제출' 버튼을 눌러 요청을 완료하세요.

신고된 정보는 검토 후 1-3일 내에 업데이트됩니다. 긴급한 경우 아래의 '추가 도움 요청' 버튼을 눌러주세요.`,
      videoUrl: "https://example.com/videos/report-station-info",
    },
    {
      id: "location-3",
      question: "충전소 길 안내가 정확하지 않아요",
      answer: `충전소 길 안내 문제 해결:
      
1. 앱을 최신 버전으로 업데이트하세요.
2. 위치 서비스가 활성화되어 있는지 확인하세요.
3. 앱 설정에서 '기본 지도 앱'을 변경해 보세요(Google 지도, 네이버 지도, 카카오맵 등).
4. 충전소 상세 페이지에서 '정확한 위치 신고'를 사용하여 위치 오류를 신고하세요.
5. 오프라인 지도를 미리 다운로드해 두면 네트워크 연결이 불안정한 지역에서도 사용할 수 있습니다.

일부 신규 충전소나 사설 충전소는 지도 데이터가 업데이트되지 않았을 수 있습니다.`,
      videoUrl: "https://example.com/videos/navigation-issues",
    },
    {
      id: "location-4",
      question: "특정 커넥터 타입의 충전소만 찾고 싶어요",
      answer: `특정 커넥터 타입 충전소 검색 방법:
      
1. 앱 메인 화면에서 '충전소 찾기'를 선택하세요.
2. '필터' 버튼을 탭하세요.
3. '커넥터 타입' 섹션에서 원하는 커넥터 타입을 선택하세요(예: DC 콤보, CHAdeMO, 타입2 등).
4. 추가 필터(급속/완속, 이용 가능 여부, 운영 시간 등)를 적용할 수 있습니다.
5. '적용' 버튼을 눌러 필터링된 충전소 목록을 확인하세요.

차량 설정에서 기본 커넥터 타입을 저장하면 매번 필터링할 필요 없이 자동으로 적합한 충전소를 보여줍니다.`,
      videoUrl: "https://example.com/videos/connector-filter",
    },
  ],
  reservation: [
    {
      id: "reservation-1",
      question: "충전 예약은 어떻게 하나요?",
      answer: `충전 예약 방법:
      
1. 앱에서 원하는 충전소를 검색하고 선택하세요.
2. 충전소 상세 페이지에서 '예약 가능' 표시가 있는지 확인하세요.
3. '충전 예약' 버튼을 탭하세요.
4. 원하는 날짜와 시간을 선택하세요.
5. 충전 시간과 커넥터 타입을 선택하세요.
6. 결제 방법을 선택하고 '예약 확인' 버튼을 누르세요.

예약은 최소 30분 전에 해야 하며, 일부 충전소는 예약 서비스를 제공하지 않을 수 있습니다.`,
      videoUrl: "https://example.com/videos/reservation-guide",
    },
    {
      id: "reservation-2",
      question: "예약을 취소하고 싶어요",
      answer: `예약 취소 방법:
      
1. 앱에서 '마이페이지' > '예약 내역'으로 이동하세요.
2. 취소하려는 예약을 선택하세요.
3. '예약 취소' 버튼을 탭하세요.
4. 취소 사유를 선택하세요(선택 사항).
5. '취소 확인' 버튼을 누르세요.

예약 시작 시간 2시간 전까지 취소하면 전액 환불됩니다. 2시간 이내 취소 시 취소 수수료가 발생할 수 있습니다. 예약 시간이 지난 후에는 취소가 불가능합니다.`,
      videoUrl: "https://example.com/videos/cancel-reservation",
    },
    {
      id: "reservation-3",
      question: "예약 시간에 도착하지 못할 것 같아요",
      answer: `예약 시간에 늦는 경우:
      
1. 앱에서 '마이페이지' > '예약 내역'으로 이동하세요.
2. 해당 예약을 선택하세요.
3. '예약 변경' 버튼을 탭하세요(예약 시작 30분 전까지만 가능).
4. 새로운 시간을 선택하세요.
5. '변경 확인' 버튼을 누르세요.

예약 시간으로부터 15분이 지나면 예약이 자동 취소되고 다른 사용자가 해당 충전기를 사용할 수 있게 됩니다. 반복적인 예약 부도는 서비스 이용 제한의 원인이 될 수 있습니다.`,
      videoUrl: "https://example.com/videos/late-arrival",
    },
    {
      id: "reservation-4",
      question: "예약했는데 충전기가 사용 중이에요",
      answer: `예약한 충전기가 사용 중인 경우:
      
1. 앱에서 해당 충전소의 상세 페이지로 이동하세요.
2. '충전기 상태 새로고침' 버튼을 탭하여 최신 상태를 확인하세요.
3. 여전히 사용 중이라면 '예약 확인' 버튼을 탭하세요.
4. 충전소 운영자에게 자동으로 알림이 전송됩니다.
5. 앱 내 채팅이나 전화로 운영자와 연결될 수 있습니다.

예약 시스템 오류로 인한 문제일 경우 전액 환불 또는 추가 크레딧이 제공됩니다. 다른 사용자가 충전 시간을 초과한 경우 운영자가 조치할 수 있습니다.`,
      videoUrl: "https://example.com/videos/occupied-charger",
    },
  ],
  vehicle: [
    {
      id: "vehicle-1",
      question: "내 차량 정보를 등록하고 싶어요",
      answer: `차량 정보 등록 방법:
      
1. 앱에 로그인 후 '마이페이지'로 이동하세요.
2. '내 차량 관리'를 선택하세요.
3. '차량 추가' 버튼을 탭하세요.
4. 차량 제조사, 모델, 연식을 선택하세요.
5. 차량 번호와 충전 포트 타입을 입력하세요.
6. '저장' 버튼을 눌러 등록을 완료하세요.

여러 대의 차량을 등록할 수 있으며, 충전 시 사용할 기본 차량을 설정할 수 있습니다. 정확한 차량 정보 등록은 맞춤형 충전소 추천과 충전 최적화에 도움이 됩니다.`,
      videoUrl: "https://example.com/videos/register-vehicle",
    },
    {
      id: "vehicle-2",
      question: "내 차량에 맞는 충전기를 찾고 싶어요",
      answer: `차량 맞춤 충전기 찾기:
      
1. 먼저 '마이페이지'에서 차량 정보가 정확히 등록되어 있는지 확인하세요.
2. 앱 메인 화면에서 '충전소 찾기'를 선택하세요.
3. '내 차량에 맞는 충전소' 옵션을 활성화하세요.
4. 지도에 표시된 충전소는 모두 등록된 차량과 호환되는 충전기를 갖추고 있습니다.
5. 충전소를 선택하면 해당 차량에 맞는 커넥터 정보가 강조 표시됩니다.

앱 설정에서 '항상 내 차량에 맞는 충전소만 표시'를 활성화하면 매번 필터링할 필요가 없습니다.`,
      videoUrl: "https://example.com/videos/compatible-chargers",
    },
    {
      id: "vehicle-3",
      question: "차량 충전 포트가 열리지 않아요",
      answer: `충전 포트가 열리지 않는 경우:
      
1. 차량이 잠금 해제되어 있는지 확인하세요.
2. 차량의 시동이 꺼져 있는지 확인하세요(일부 차량은 시동이 켜진 상태에서 충전 포트가 열리지 않음).
3. 키 리모컨의 충전 포트 열기 버튼을 사용해 보세요.
4. 차량 내부의 충전 포트 열림 버튼을 찾아 눌러보세요.
5. 차량 매뉴얼에서 충전 포트 비상 열림 방법을 확인하세요.

극한의 추위에서는 충전 포트가 얼어붙을 수 있습니다. 차량을 따뜻한 곳으로 이동시키거나 해동 시간을 기다려 보세요.`,
      videoUrl: "https://example.com/videos/charging-port-issues",
    },
    {
      id: "vehicle-4",
      question: "배터리 관리 팁이 필요해요",
      answer: `전기차 배터리 관리 팁:
      
1. 배터리 수명을 위해 충전 수준을 20-80% 사이로 유지하는 것이 좋습니다.
2. 장기간 주차 시 배터리를 40-60% 수준으로 충전해 두세요.
3. 가능하면 급속 충전보다 완속 충전을 사용하세요.
4. 극단적인 온도에서는 배터리 성능이 저하될 수 있으므로 가능한 적정 온도에서 주차하세요.
5. 배터리 관리 시스템(BMS)을 정기적으로 업데이트하세요.

대부분의 현대 전기차는 배터리 관리 시스템이 자동으로 최적화되어 있지만, 이러한 팁을 따르면 배터리 수명과 성능을 더욱 향상시킬 수 있습니다.`,
      videoUrl: "https://example.com/videos/battery-management",
    },
  ],
  emergency: [
    {
      id: "emergency-1",
      question: "충전 중 화재가 발생했어요",
      answer: `충전 중 화재 발생 시 대처 방법:
      
1. 즉시 비상 정지 버튼을 눌러 충전을 중단하세요.
2. 안전한 거리로 대피하세요.
3. 119에 신고하고 전기차 화재임을 명확히 알리세요.
4. 가능하다면 주변 사람들에게 알려 대피를 돕고, 충전소 접근을 막으세요.
5. 소화기가 있다면 초기 화재에 대응할 수 있지만, 본인의 안전이 우선입니다.

전기차 화재는 일반 차량과 다른 소화 방법이 필요하므로, 반드시 소방관에게 전기차 화재임을 알리세요.`,
      videoUrl: "https://example.com/videos/fire-emergency",
    },
    {
      id: "emergency-2",
      question: "충전 중 감전이 의심돼요",
      answer: `충전 중 감전 의심 시 대처 방법:
      
1. 즉시 비상 정지 버튼을 눌러 충전을 중단하세요.
2. 충전기나 차량에 접촉하지 마세요.
3. 다른 사람이 접근하지 못하도록 안전 거리를 확보하세요.
4. 충전소 운영자나 긴급 서비스(119)에 연락하세요.
5. 의학적 증상(저림, 화상, 심장 두근거림 등)이 있으면 즉시 의료 도움을 요청하세요.

젖은 환경에서는 충전을 시도하지 마세요. 충전 케이블이나 커넥터가 손상된 경우 사용하지 마세요.`,
      videoUrl: "https://example.com/videos/electric-shock",
    },
    {
      id: "emergency-3",
      question: "충전소에서 사고가 났어요",
      answer: `충전소에서 사고 발생 시 대처 방법:
      
1. 우선 본인과 타인의 안전을 확보하세요.
2. 필요시 119(구급차)나 112(경찰)에 신고하세요.
3. 충전 중이었다면 비상 정지 버튼을 눌러 충전을 중단하세요.
4. 충전소 운영자에게 연락하여 상황을 알리세요.
5. 사고 현장과 피해 상황을 사진으로 기록해 두세요.

보험 청구를 위해 사고 경위, 시간, 장소, 관련자 연락처 등을 기록해 두는 것이 좋습니다. 충전소 CCTV 영상 보존을 요청하세요.`,
      videoUrl: "https://example.com/videos/accident-response",
    },
    {
      id: "emergency-4",
      question: "주행 중 배터리가 방전될 것 같아요",
      answer: `주행 중 배터리 방전 임박 시 대처 방법:
      
1. 에어컨, 히터 등 전력 소모가 큰 기능을 최소화하세요.
2. 에코 모드나 배터리 절약 모드를 활성화하세요.
3. 앱에서 '긴급 충전소 찾기'를 실행하여 가장 가까운 충전소를 찾으세요.
4. 내리막길에서는 회생 제동을 최대한 활용하세요.
5. 배터리가 완전히 방전되면 견인 서비스를 요청하세요.

대부분의 전기차는 배터리 잔량이 매우 낮을 때 자동으로 성능을 제한하여 최대한 거리를 확보합니다. 정기적으로 충전 계획을 세우고 주행하는 것이 좋습니다.`,
      videoUrl: "https://example.com/videos/battery-depletion",
    },
  ],
  app: [
    {
      id: "app-1",
      question: "앱이 자꾸 종료돼요",
      answer: `앱이 계속 종료되는 경우 해결 방법:
      
1. 앱을 최신 버전으로 업데이트하세요.
2. 기기를 재부팅하세요.
3. 앱 캐시를 삭제하세요(설정 > 앱 > 전기차 충전 앱 > 저장공간 > 캐시 삭제).
4. 앱을 삭제하고 다시 설치해 보세요.
5. 기기의 저장 공간이 충분한지 확인하세요.

문제가 지속되면 앱 설정의 '오류 보고' 기능을 통해 로그를 전송해 주세요. 기기 모델과 운영체제 버전을 함께 알려주시면 더 빠른 해결에 도움이 됩니다.`,
      videoUrl: "https://example.com/videos/app-crashes",
    },
    {
      id: "app-2",
      question: "충전소 정보가 로딩되지 않아요",
      answer: `충전소 정보 로딩 문제 해결:
      
1. 인터넷 연결 상태를 확인하세요.
2. 앱을 최신 버전으로 업데이트하세요.
3. 앱을 완전히 종료한 후 다시 실행해 보세요.
4. 위치 서비스가 활성화되어 있는지 확인하세요.
5. 앱 설정에서 '지도 데이터 새로고침'을 실행해 보세요.

일시적인 서버 문제일 수 있으니 잠시 후 다시 시도해 보세요. 특정 지역에서만 문제가 발생한다면 해당 지역의 충전소 데이터가 업데이트 중일 수 있습니다.`,
      videoUrl: "https://example.com/videos/loading-issues",
    },
    {
      id: "app-3",
      question: "푸시 알림이 오지 않아요",
      answer: `푸시 알림 문제 해결:
      
1. 기기 설정에서 앱의 알림 권한이 허용되어 있는지 확인하세요.
2. 앱 설정 > 알림 설정에서 원하는 알림 유형이 활성화되어 있는지 확인하세요.
3. 방해 금지 모드나 집중 모드가 활성화되어 있지 않은지 확인하세요.
4. 앱을 최신 버전으로 업데이트하세요.
5. 기기를 재부팅해 보세요.

일부 기기에서는 배터리 최적화 설정이 알림을 차단할 수 있습니다. 배터리 설정에서 앱을 '최적화 제외' 목록에 추가해 보세요.`,
      videoUrl: "https://example.com/videos/notification-issues",
    },
    {
      id: "app-4",
      question: "앱 사용량이 너무 많아요",
      answer: `앱 데이터 및 배터리 사용량 최적화:
      
1. 앱 설정 > 데이터 사용에서 '오프라인 지도 사용'을 활성화하세요.
2. '백그라운드 위치 추적'을 '앱 사용 중에만'으로 설정하세요.
3. 불필요한 알림을 비활성화하세요.
4. 앱 설정 > 데이터 사용에서 '자동 새로고침 간격'을 늘리세요.
5. 앱 캐시를 정기적으로 삭제하세요.

최신 버전의 앱은 일반적으로 데이터 및 배터리 사용이 최적화되어 있습니다. 앱을 최신 상태로 유지하세요.`,
      videoUrl: "https://example.com/videos/optimize-app",
    },
  ],
  membership: [
    {
      id: "membership-1",
      question: "멤버십 가입 방법이 궁금해요",
      answer: `멤버십 가입 방법:
      
1. 앱에 로그인 후 '멤버십' 메뉴로 이동하세요.
2. '멤버십 가입하기' 버튼을 탭하세요.
3. 제공되는 멤버십 플랜을 비교하고 원하는 플랜을 선택하세요.
4. 결제 정보를 입력하고 이용 약관에 동의하세요.
5. '가입 완료' 버튼을 눌러 가입을 완료하세요.

멤버십은 월간, 연간 플랜으로 제공되며, 첫 가입 시 7일 무료 체험이 제공됩니다. 무료 체험 기간 내에 해지해도 요금이 청구되지 않습니다.`,
      videoUrl: "https://example.com/videos/membership-signup",
    },
    {
      id: "membership-2",
      question: "멤버십 혜택이 궁금해요",
      answer: `멤버십 혜택 안내:
      
1. 충전 요금 할인: 모든 제휴 충전소에서 kWh당 50-100원 할인
2. 예약 우선권: 혼잡 시간대에 충전기 예약 우선권 제공
3. 무료 충전 크레딧: 월 5,000원 상당의 충전 크레딧 제공
4. 전용 고객센터: 24시간 전용 고객센터 이용 가능
5. 파트너사 혜택: 제휴 카페, 레스토랑, 쇼핑몰에서 추가 할인 제공

멤버십 등급에 따라 혜택이 다를 수 있으며, 특별 프로모션 기간에는 추가 혜택이 제공될 수 있습니다. 자세한 내용은 앱의 '멤버십 혜택' 페이지에서 확인하세요.`,
      videoUrl: "https://example.com/videos/membership-benefits",
    },
    {
      id: "membership-3",
      question: "멤버십을 해지하고 싶어요",
      answer: `멤버십 해지 방법:
      
1. 앱에 로그인 후 '마이페이지' > '멤버십 관리'로 이동하세요.
2. '멤버십 해지' 버튼을 탭하세요.
3. 해지 사유를 선택하세요(선택 사항).
4. '해지 확인' 버튼을 눌러 진행하세요.
5. 해지 확인 메시지를 확인하세요.

멤버십은 현재 결제 주기의 마지막 날까지 유효하며, 그 이후에는 자동 갱신되지 않습니다. 이미 결제된 기간에 대한 환불은 불가능합니다. 연간 멤버십의 경우 중도 해지 시 월간 요금으로 재계산되어 차액이 환불될 수 있습니다.`,
      videoUrl: "https://example.com/videos/cancel-membership",
    },
    {
      id: "membership-4",
      question: "멤버십 결제일을 변경하고 싶어요",
      answer: `멤버십 결제일 변경 방법:
      
1. 앱에 로그인 후 '마이페이지' > '멤버십 관리'로 이동하세요.
2. '결제 정보 관리'를 선택하세요.
3. '결제일 변경'을 탭하세요.
4. 원하는 결제일을 선택하세요(1일-28일 중 선택 가능).
5. '변경 확인' 버튼을 눌러 완료하세요.

결제일 변경은 다음 결제 주기부터 적용됩니다. 변경에 따라 첫 적용 월에는 일할 계산된 금액이 청구될 수 있습니다. 결제일 변경은 월 1회로 제한됩니다.`,
      videoUrl: "https://example.com/videos/change-billing-date",
    },
  ],
}

export function TroubleshootingGuide() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("charging")
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    phone: "",
    issue: "",
  })

  // 인기 검색어
  const popularQueries = [
    "충전이 안돼요",
    "결제 실패",
    "비밀번호 찾기",
    "충전 중단",
    "가까운 충전소",
    "멤버십 혜택",
    "배터리 관리",
    "충전 예약",
  ]

  // 검색 결과 필터링
  const filteredGuides = Object.entries(troubleshootingData).flatMap(([category, guides]) => {
    return guides.filter(
      (guide) =>
        guide.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.answer.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  })

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 실제 구현에서는 API 호출로 티켓 생성
    alert("문의가 접수되었습니다. 담당자가 빠르게 연락드리겠습니다.")
    setShowContactForm(false)
    setContactFormData({
      name: "",
      email: "",
      phone: "",
      issue: "",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          전기차 충전 문제 해결 가이드
        </CardTitle>
        <CardDescription>자주 발생하는 문제에 대한 해결책을 찾아보세요</CardDescription>
      </CardHeader>
      <CardContent>
        <TroubleshootingSearch onSearch={(query) => setSearchQuery(query)} popularQueries={popularQueries} />

        {searchQuery ? (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">검색 결과: {filteredGuides.length}개</h3>
            {filteredGuides.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {filteredGuides.map((guide) => (
                  <AccordionItem key={guide.id} value={guide.id}>
                    <AccordionTrigger>{guide.question}</AccordionTrigger>
                    <AccordionContent>
                      <div className="whitespace-pre-line">{guide.answer}</div>
                      {guide.videoUrl && (
                        <Button variant="link" className="p-0 mt-2" asChild>
                          <a href={guide.videoUrl} target="_blank" rel="noopener noreferrer">
                            관련 동영상 가이드 보기
                          </a>
                        </Button>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">검색 결과가 없습니다.</p>
                <Button variant="outline" className="mt-4" onClick={() => setShowContactForm(true)}>
                  추가 도움 요청하기
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid grid-cols-7 mb-4">
              <TabsTrigger value="charging" className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">충전 문제</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">결제 문제</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">계정 관리</span>
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">위치 찾기</span>
              </TabsTrigger>
              <TabsTrigger value="reservation" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">예약 관리</span>
              </TabsTrigger>
              <TabsTrigger value="vehicle" className="flex items-center gap-1">
                <Car className="h-4 w-4" />
                <span className="hidden sm:inline">차량 관리</span>
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">긴급 상황</span>
              </TabsTrigger>
              <TabsTrigger value="app" className="flex items-center gap-1">
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">앱 문제</span>
              </TabsTrigger>
              <TabsTrigger value="membership" className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">멤버십</span>
              </TabsTrigger>
            </TabsList>

            {Object.entries(troubleshootingData).map(([category, guides]) => (
              <TabsContent key={category} value={category} className="mt-0">
                <Accordion type="single" collapsible className="w-full">
                  {guides.map((guide) => (
                    <AccordionItem key={guide.id} value={guide.id}>
                      <AccordionTrigger>{guide.question}</AccordionTrigger>
                      <AccordionContent>
                        <div className="whitespace-pre-line">{guide.answer}</div>
                        {guide.videoUrl && (
                          <Button variant="link" className="p-0 mt-2" asChild>
                            <a href={guide.videoUrl} target="_blank" rel="noopener noreferrer">
                              관련 동영상 가이드 보기
                            </a>
                          </Button>
                        )}
                        {/* 시각적 가이드 추가 - 특정 카테고리와 가이드에 대해서만 표시 */}
                        {(category === "charging" ||
                          category === "payment" ||
                          category === "vehicle" ||
                          category === "emergency") && (
                          <TroubleshootingVisualGuide category={category} guideId={guide.id} />
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {showContactForm ? (
          <div className="mt-6 border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">추가 도움 요청하기</h3>
            <form onSubmit={handleContactSubmit}>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      이름
                    </label>
                    <Input
                      id="name"
                      value={contactFormData.name}
                      onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      연락처
                    </label>
                    <Input
                      id="phone"
                      value={contactFormData.phone}
                      onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    이메일
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={contactFormData.email}
                    onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="issue" className="text-sm font-medium">
                    문제 설명
                  </label>
                  <textarea
                    id="issue"
                    className="w-full min-h-[100px] p-2 border rounded-md"
                    value={contactFormData.issue}
                    onChange={(e) => setContactFormData({ ...contactFormData, issue: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowContactForm(false)}>
                    취소
                  </Button>
                  <Button type="submit">제출하기</Button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="mt-6 text-center">
            <p className="text-muted-foreground mb-2">원하는 해결책을 찾지 못하셨나요?</p>
            <Button onClick={() => setShowContactForm(true)}>추가 도움 요청하기</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM 요소 선택
    const chatBody = document.getElementById('chat-body');
    const landingView = document.getElementById('landing-view');
    const responseContainer = document.getElementById('response-container');

    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const pillButtons = document.querySelectorAll('.pill-button');

    // 모달 관련 요소
    const moreOptionsBtn = document.querySelector('.more-options');
    const modalOverlay = document.getElementById('contactModal');
    const closeModalBtn = document.querySelector('.close-button');

    // API 엔드포인트
    const API_ENDPOINT = '/api/chatbot_webUI';

    // ----------------------------------------------------------------
    // 2. 화면 전환 및 스크롤 함수
    // ----------------------------------------------------------------

    // 스크롤을 맨 아래로 이동
    function scrollToBottom() {
        chatBody.scrollTo({
            top: chatBody.scrollHeight,
            behavior: 'smooth'
        });
    }

    // 랜딩 페이지 숨기지 않고 대화창 활성화
    function activateChatContainer() {
        if (responseContainer.style.display === 'none' || responseContainer.style.display === '') {
            responseContainer.style.display = 'flex';
            responseContainer.style.flexDirection = 'column';
        }
    }

    // 텍스트 포맷팅
    // script.js

    // 텍스트 포맷팅 (수정됨)
    function formatText(text) {
        if (!text) return "";

        // 1. **굵게** 처리
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

        // 2. 줄바꿈 처리: \n을 <br>로 바꾸되, 연속된 줄바꿈은 하나로 처리하거나 적절히 조절
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }
    // ----------------------------------------------------------------
    // 3. 메시지 추가 함수
    // ----------------------------------------------------------------

    // 사용자 메시지 추가
    function addUserMessage(text) {
        activateChatContainer();

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'user-message');
        messageDiv.innerHTML = `
            <div class="text-bubble user-bubble">
                ${formatText(text)}
            </div>
        `;
        responseContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    // 봇 메시지 추가
    function addBotMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'bot-message');

        messageDiv.innerHTML = `
        <div class="initial-greeting-wrapper">
            <div class="greeting-avatar">
                <img src="logo_thumb.png" alt="매비 아바타">
            </div>

            <div class="greeting-message-bubble">
                ${formatText(text)}
            </div>
              </div>
        `;
        responseContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    // ----------------------------------------------------------------
    // 4. API 호출 로직
    // ----------------------------------------------------------------
    async function callApiAndGetResponse(userMessage) {
        addBotMessage("...답변을 생성하고 있습니다...");

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMessage })
            });

            // 1. 읽기 도구(Reader) 생성
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botAnswer = ""; // 답변을 누적할 변수
            // 2. 채팅방에 빈 말풍선 먼저 추가 (여기에 글자를 채울 예정)
            // addBotMessage 함수가 말풍선 요소를 리턴하도록 수정하거나, 
            // 여기서 직접 DOM 요소를 만들어야 합니다. 예시:
            const botBubble = document.createElement("div");
            botBubble.className = "bot-message"; // 사용자님 CSS 클래스
            chatContainer.appendChild(botBubble);


            // 3. 스트림 읽기 시작 (무한 루프)
            while (true) {
                const { done, value } = await reader.read();

                if (done) break; // 스트림이 끝나면 루프 종료

                // 조각 데이터를 텍스트로 변환
                const chunk = decoder.decode(value, { stream: true });

                // 4. 화면에 실시간 업데이트 (타자기 효과)
                botAnswer += chunk;
                botBubble.innerText = botAnswer; // 말풍선 내용 갱신

                // 스크롤을 맨 아래로 내리기 (선택사항)
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }

        } catch (error) {
            console.error(error);
            if (responseContainer.lastElementChild) {
                responseContainer.lastElementChild.remove();
            }
            addBotMessage("서버와 통신 중 오류가 발생했습니다.");
        }
    }

    // ----------------------------------------------------------------
    // 5. 이벤트 리스너 (업데이트됨)
    // ----------------------------------------------------------------
    // ----------------------------------------------------------------
    // 5. 이벤트 리스너 (줄바꿈 중복 문제 해결됨)
    // ----------------------------------------------------------------

    pillButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            const text = button.innerText.trim();

            addUserMessage(text); // 사용자 메시지 추가

            // 🌟 버튼별 하드코딩 답변 처리 
            // (<br> 태그를 줄이고 엔터로 줄바꿈을 처리하여 간격을 좁혔습니다)
            if (action === 'ces-schedule') {
                setTimeout(() => {
                    addBotMessage(`<b>📅 CES 2026 운영 시간</b>

- <b>1월 6일(화):</b> 10 AM - 6 PM
- <b>1월 7일(수):</b> 9 AM - 6 PM
- <b>1월 8일(목):</b> 9 AM - 6 PM
- <b>1월 9일(금):</b> 9 AM - 4 PM

<span style="font-size: 13px; color: #666;">※ 현지 시간 기준이며, 상황에 따라 변동될 수 있습니다.</span>`);
                }, 600);

            } else if (action === 'venue-info') {
                setTimeout(() => {
                    addBotMessage(`<b>📍 주요 전시장 안내</b>

<b>1. LVCC (라스베이거스 컨벤션 센터)</b>
- 메인 전시, 모빌리티(West), 로보틱스(North), 가전(Central)

<b>2. Venetian Expo (베네시안 엑스포)</b>
- 유레카 파크(스타트업), 글로벌 파빌리온, 라이프스타일

<b>3. ARIA / C Space</b>
- 미디어, 광고, 엔터테인먼트 기술

<b>4. Wynn / Encore</b>
- 삼성전자 단독 전시관 및 비공개 미팅룸`);
                }, 600);

            } else if (action === 'keynote-info') {
                setTimeout(() => {
                    addBotMessage(`<b>🎤 주요 기조연설 (Keynote)</b>

<b>1. 리사 수 (AMD CEO)</b>
- 1/5, Venetian Palazzo Ballroom
- 고성능 AI 컴퓨팅 및 미래 전략 발표

<b>2. 양위안칭 (Lenovo CEO)</b>
- Sphere(스피어) 무대
- "Smarter AI for All" (하이브리드 AI 비전)

<b>3. 게리 샤피로 (CTA 회장)</b>
- CES 파운드리(AI·블록체인·양자) 신설 소개`);
                }, 600);

            } else if (action === 'floor-map') {
                setTimeout(() => {
                    addBotMessage(`<b>🔗 CES 2026 플로어맵</b>

공식 웹사이트 또는 모바일 앱에서 실시간 지도를 확인하실 수 있습니다.
원하시는 전시관(예: 삼성, LVCC West)을 말씀해주시면 위치를 안내해 드릴게요! 😉`);
                }, 600);

            } else if (action === 'innovation-award') {
                setTimeout(() => {
                    addBotMessage(`<b>🏆 CES 2026 최고혁신상 하이라이트</b>

올해 최고혁신상 30개 중 <b>절반(15개)</b>을 한국 기업이 수상했습니다! 🎉

<b>✨ 주요 수상작:</b>
- <b>두산로보틱스:</b> AI 자율 로봇 '스캔앤고'
- <b>딥퓨전에이아이:</b> 4D 레이더 'RAPA'
- <b>삼성전자:</b> 양자내성암호 기술
- <b>LG전자, 네이션에이, 둠둠 등</b> 다수 수상`);
                }, 600);

            } else {
                // 그 외 버튼이나 입력창 질문은 API 호출 (AI 답변)
                callApiAndGetResponse(text);
            }
        });
    });

    // 전송 버튼 및 엔터키 처리
    function handleSendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        messageInput.value = '';
        addUserMessage(text);
        callApiAndGetResponse(text);
    }

    sendButton.addEventListener('click', handleSendMessage);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });

    // 모달 팝업 관련
    if (moreOptionsBtn && modalOverlay) {
        moreOptionsBtn.addEventListener('click', () => modalOverlay.style.display = 'flex');
        closeModalBtn.addEventListener('click', () => modalOverlay.style.display = 'none');
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) modalOverlay.style.display = 'none';
        });
    }
});
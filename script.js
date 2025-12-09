document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM 요소 선택
    const chatBody = document.getElementById('chat-body');
    const responseContainer = document.getElementById('response-container');

    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const pillButtons = document.querySelectorAll('.pill-button');

    // 모달 관련 요소
    const moreOptionsBtn = document.querySelector('.more-options');
    const modalOverlay = document.getElementById('contactModal');
    const closeModalBtn = document.querySelector('.close-button');

    // API 엔드포인트
    // const API_ENDPOINT = '/api/chatbot_webUI';
    const API_ENDPOINT = 'https://f946b3e79c62.ngrok-free.app/chatbot_webUI';

    // ----------------------------------------------------------------
    // 2. 화면 전환 및 스크롤 함수
    // ----------------------------------------------------------------

    // 스크롤을 맨 아래로 이동
    function scrollToBottom() {
        if (chatBody) {
            chatBody.scrollTo({
                top: chatBody.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    // 랜딩 페이지 숨기지 않고 대화창 활성화
    function activateChatContainer() {
        if (responseContainer.style.display === 'none' || responseContainer.style.display === '') {
            responseContainer.style.display = 'flex';
            responseContainer.style.flexDirection = 'column';
        }
    }

    // 텍스트 포맷팅 (Markdown 스타일 -> HTML 변환)
    function formatText(text) {
        if (!text) return "";

        // 1. **굵게** 처리
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

        // 2. 줄바꿈 처리: \n을 <br>로 변환
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

    // 봇 메시지 추가 (★ return 추가됨)
    function addBotMessage(text) {
        activateChatContainer(); // 봇 메시지 올 때도 컨테이너 활성화 안전장치

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

        return messageDiv; // ★ [중요] 생성된 요소를 반드시 반환해야 함!
    }

    // ----------------------------------------------------------------
    // 4. API 호출 로직 (스트리밍)
    // ----------------------------------------------------------------
    async function callApiAndGetResponse(userMessage) {
        // 1. "생성 중..." 말풍선 만들기
        const messageElement = addBotMessage("... 답변 생성 중 ...");

        // 2. 텍스트를 업데이트할 내부 요소 찾기
        // (addBotMessage HTML 구조의 class="greeting-message-bubble"을 찾아야 함)
        const bubbleText = messageElement.querySelector(".greeting-message-bubble");

        if (!bubbleText) {
            console.error("말풍선 내부 텍스트 요소를 찾을 수 없습니다.");
            return;
        }

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });

            if (!response.ok) {
                throw new Error(`서버 응답 오류: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botAnswer = "";
            let isFirstChunk = true;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // 조각 데이터 디코딩
                const chunk = decoder.decode(value, { stream: true });

                // 첫 데이터 도착 시 "...생성 중" 지우기
                if (isFirstChunk) {
                    bubbleText.innerText = "";
                    isFirstChunk = false;
                }

                // 텍스트 누적
                botAnswer += chunk;

                // ★ formatText를 적용하여 줄바꿈과 볼드체를 실시간 렌더링
                bubbleText.innerHTML = formatText(botAnswer);

                // 스크롤 유지
                scrollToBottom();
            }

        } catch (error) {
            console.error("Stream Error:", error);
            bubbleText.innerHTML = "<span style='color:red;'>죄송합니다. 서버 연결 중 오류가 발생했습니다.</span>";
        }
    }

    // ----------------------------------------------------------------
    // 5. 이벤트 리스너
    // ----------------------------------------------------------------

    pillButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            const text = button.innerText.trim();

            addUserMessage(text); // 사용자 말풍선 추가

            // 하드코딩된 답변 처리
            if (action === 'ces-schedule') {
                setTimeout(() => {
                    addBotMessage(`**📅 CES 2026 운영 시간**\n\n- **1월 6일(화):** 10 AM - 6 PM\n- **1월 7일(수):** 9 AM - 6 PM\n- **1월 8일(목):** 9 AM - 6 PM\n- **1월 9일(금):** 9 AM - 4 PM\n\n<span style="font-size: 13px; color: #666;">※ 현지 시간 기준이며, 상황에 따라 변동될 수 있습니다.</span>`);
                }, 600);

            } else if (action === 'venue-info') {
                setTimeout(() => {
                    addBotMessage(`**📍 주요 전시장 안내**\n\n**1. LVCC (라스베이거스 컨벤션 센터)**\n- 메인 전시, 모빌리티(West), 로보틱스(North), 가전(Central)\n\n**2. Venetian Expo (베네시안 엑스포)**\n- 유레카 파크(스타트업), 글로벌 파빌리온, 라이프스타일\n\n**3. ARIA / C Space**\n- 미디어, 광고, 엔터테인먼트 기술\n\n**4. Wynn / Encore**\n- 삼성전자 단독 전시관 및 비공개 미팅룸`);
                }, 600);

            } else if (action === 'keynote-info') {
                setTimeout(() => {
                    addBotMessage(`**🎤 주요 기조연설 (Keynote)**\n\n**1. 리사 수 (AMD CEO)**\n- 1/5, Venetian Palazzo Ballroom\n- 고성능 AI 컴퓨팅 및 미래 전략 발표\n\n**2. 양위안칭 (Lenovo CEO)**\n- Sphere(스피어) 무대\n- "Smarter AI for All" (하이브리드 AI 비전)\n\n**3. 게리 샤피로 (CTA 회장)**\n- CES 파운드리(AI·블록체인·양자) 신설 소개`);
                }, 600);

            } else if (action === 'floor-map') {
                setTimeout(() => {
                    addBotMessage(`**🔗 CES 2026 플로어맵**\n\n공식 웹사이트 또는 모바일 앱에서 실시간 지도를 확인하실 수 있습니다.\n원하시는 전시관(예: 삼성, LVCC West)을 말씀해주시면 위치를 안내해 드릴게요! 😉`);
                }, 600);

            } else if (action === 'innovation-award') {
                setTimeout(() => {
                    addBotMessage(`**🏆 CES 2026 최고혁신상 하이라이트**\n\n올해 최고혁신상 30개 중 **절반(15개)**을 한국 기업이 수상했습니다! 🎉\n\n**✨ 주요 수상작:**\n- **두산로보틱스:** AI 자율 로봇 '스캔앤고'\n- **딥퓨전에이아이:** 4D 레이더 'RAPA'\n- **삼성전자:** 양자내성암호 기술\n- **LG전자, 네이션에이, 둠둠 등** 다수 수상`);
                }, 600);

            } else {
                // 그 외 버튼은 AI 호출
                callApiAndGetResponse(text);
            }
        });
    });

    // 메시지 전송 핸들러
    function handleSendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        messageInput.value = '';
        addUserMessage(text);
        callApiAndGetResponse(text);
    }

    if (sendButton) {
        sendButton.addEventListener('click', handleSendMessage);
    }

    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSendMessage();
        });
    }

    // 모달 팝업 이벤트
    if (moreOptionsBtn && modalOverlay) {
        moreOptionsBtn.addEventListener('click', () => modalOverlay.style.display = 'flex');
        closeModalBtn.addEventListener('click', () => modalOverlay.style.display = 'none');
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) modalOverlay.style.display = 'none';
        });
    }
});
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

    // API 엔드포인트    //챗봇홈가기
    const backBtn = document.getElementById('back-btn');
    // const API_ENDPOINT = '/api/chatbot_webUI';
    const API_ENDPOINT = 'https://f946b3e79c62.ngrok-free.app/chatbot_webUI';
    let chatHistory = [];

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

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // index.html로 이동 (같은 경로/루트에 있을 경우)
            window.location.href = 'index.html';

            // 또는
            // window.location.assign('index.html');
        });
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
                body: JSON.stringify({
                    query: userMessage,
                    // [수정됨] 대화 내역을 함께 전송
                    history: chatHistory
                })
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
            chatHistory.push({ role: "user", content: userMessage });
            chatHistory.push({ role: "assistant", content: botAnswer });

            // 디버깅용: 콘솔에서 쌓이는 내역 확인 가능
            console.log("Current History:", chatHistory);
        } catch (error) {
            console.error("Stream Error:", error);
            bubbleText.innerHTML = "<span style='color:red;'>죄송합니다. 서버 연결 중 오류가 발생했습니다.</span>";
        }
    }

    // ----------------------------------------------------------------
    // 5. 이벤트 리스너
    // ----------------------------------------------------------------

    // ----------------------------------------------------------------
    // 5. 이벤트 리스너 (수정됨: FAQ 페이지 이동)
    // ----------------------------------------------------------------

    pillButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            const text = button.innerText.trim();

            // 하드코딩된 주제들은 faq.html로 이동
            const faqTopics = ['ces-schedule', 'venue-info', 'keynote-info', 'floor-map', 'innovation-award'];

            if (faqTopics.includes(action)) {
                // 🌟 핵심: faq.html로 이동하면서 topic 파라미터 전달
                window.location.href = `faq.html?topic=${action}`;
            } else {
                // 그 외 버튼이나 기능은 기존처럼 채팅방에 표시
                addUserMessage(text);
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



// faq 
const faqData = {
    'ces-schedule': {
        question: '📅 CES 2026 전시장별 운영시간',
        answer: `
                    <strong>CES 2026 공식 운영 시간입니다.</strong><br><br>
                    <ul>
                        <li><strong>1월 6일(화):</strong> 10 AM - 6 PM</li>
                        <li><strong>1월 7일(수):</strong> 9 AM - 6 PM</li>
                        <li><strong>1월 8일(목):</strong> 9 AM - 6 PM</li>
                        <li><strong>1월 9일(금):</strong> 9 AM - 4 PM</li>
                    </ul>
                    <div class="highlight-box">
                        ※ 현지 시간 기준이며, 상황에 따라 변동될 수 있습니다.
                    </div>
                `
    },
    'venue-info': {
        question: '📍 전시장 안내',
        answer: `
                    <strong>라스베이거스 주요 전시장 특징입니다.</strong><br><br>
                    <strong>1. LVCC (컨벤션 센터)</strong><br>
                    메인 전시, 모빌리티(West), 로보틱스(North), 가전(Central)<br><br>
                    
                    <strong>2. Venetian Expo</strong><br>
                    유레카 파크(스타트업), 글로벌 파빌리온<br><br>
                    
                    <strong>3. ARIA / C Space</strong><br>
                    미디어, 광고, 엔터테인먼트 기술
                `
    },
    'keynote-info': {
        question: '🔍 기조연설 정보',
        answer: `
                    <strong>올해의 핵심 기조연설자(Keynote)입니다.</strong><br><br>
                    🎤 <strong>리사 수 (AMD CEO)</strong><br>
                    - 고성능 AI 컴퓨팅 전략 발표<br><br>

                    🎤 <strong>양위안칭 (Lenovo CEO)</strong><br>
                    - "Smarter AI for All" 비전 공유<br><br>

                    🗣️ <strong>게리 샤피로 (CTA 회장)</strong><br>
                    - CES 파운드리(AI·블록체인) 소개
                `
    },
    'floor-map': {
        question: '🔗 CES 2026 플로어맵 바로가기',
        answer: `
                    <strong>길을 찾고 계신가요?</strong><br><br>
                    CES 공식 웹사이트 또는 모바일 앱에서 
                    실시간 인터랙티브 지도를 확인하실 수 있습니다.<br><br>
                    찾으시는 기업명(예: 삼성, LG)을 입력창에 검색하시면 위치를 글로 안내해 드릴게요! 😉
                `
    },
    'innovation-award': {
        question: '🏆 CES 2026 최고혁신상 수상작',
        answer: `
                    <strong>K-테크의 위상을 확인하세요!</strong><br><br>
                    최고혁신상 30개 중 <strong>15개</strong>를 한국 기업이 수상했습니다. 🎉<br><br>
                    ✨ <strong>주요 수상작:</strong><br>
                    - 두산로보틱스 (로봇)<br>
                    - 딥퓨전에이아이 (4D 레이더)<br>
                    - 삼성전자 (양자내성암호)<br>
                    - LG전자, 둠둠 등 다수
                `
    }
};

// ----------------------------------------------------
// 2. 페이지 로드 시 내용 채우기
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // URL 파라미터 가져오기 (?topic=ces-schedule 등)
    const urlParams = new URLSearchParams(window.location.search);
    const topic = urlParams.get('topic');

    // DOM 요소 선택
    const userBubble = document.getElementById('user-question-text');
    const botBubble = document.getElementById('bot-answer-text');

    if (topic && faqData[topic]) {
        // 데이터가 있으면 채워넣기
        userBubble.innerText = faqData[topic].question; // 사용자 말풍선
        botBubble.innerHTML = faqData[topic].answer;    // 봇 답변 (HTML 허용)
    } else {
        // 데이터가 없거나 잘못된 접근일 때
        userBubble.innerText = "잘못된 접근입니다.";
        botBubble.innerText = "해당 정보를 찾을 수 없습니다. 다시 시도해주세요.";
    }

});
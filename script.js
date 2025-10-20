document.addEventListener('DOMContentLoaded', () => {
    const mainOptions = document.getElementById('main-options');
    const responseContainer = document.getElementById('response-container');
    const chatBody = document.getElementById('chat-body');
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');

    // 챗봇 API 엔드포인트 (실제 사용 시 수정 필요)
    const API_ENDPOINT = 'YOUR_CHATBOT_API_ENDPOINT'; 

    // 스크롤을 가장 아래로 이동하는 함수
    const scrollToBottom = () => {
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    /**
     * 사용자 메시지를 화면에 추가하는 함수
     * @param {string} message - 사용자 입력 메시지
     */
    const addUserMessageToScreen = (message) => {
        const userMessageHtml = `
            <div class="message user-message" style="margin-bottom: 10px;">
                <div class="message-content text-bubble">
                    ${message}
                </div>
            </div>
        `;
        responseContainer.insertAdjacentHTML('beforeend', userMessageHtml);
        scrollToBottom();
    };

    /**
     * 챗봇 메시지를 화면에 추가하는 함수
     * @param {string} message - 챗봇 응답 메시지 (API 응답)
     */
    const addBotMessageToScreen = (message) => {
        const botMessageHtml = `
            <div class="message bot-message" style="margin-bottom: 15px;">
                <img src="chatbot_logo.jpg" alt="CES AI Logo" class="bot-avatar ces-logo">
                <div class="message-content text-bubble">
                    ${message}
                </div>
            </div>
        `;
        responseContainer.insertAdjacentHTML('beforeend', botMessageHtml);
        scrollToBottom();
    };

    /**
     * API 호출을 처리하는 함수 (실제 API 로직)
     * @param {string} message - 사용자 입력 메시지
     */
    const callApiAndGetResponse = async (message) => {
        // 로딩 메시지 표시 (선택사항)
        addBotMessageToScreen("...답변을 생성 중입니다...");

        try {
            // 실제 API 호출 로직 (fetch 사용 예시)
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer YOUR_API_KEY' // 필요한 경우
                },
                body: JSON.stringify({ query: message })
            });

            if (!response.ok) {
                throw new Error('API 호출 실패');
            }

            const data = await response.json();
            
            // 기존 로딩 메시지 제거 (또는 마지막 메시지 업데이트)
            responseContainer.lastElementChild.remove(); 
            
            // API 응답 메시지 추가 (data.text나 data.answer 등을 사용)
            addBotMessageToScreen(data.answer || "죄송합니다. 답변을 가져올 수 없습니다.");

        } catch (error) {
            console.error('API Error:', error);
            responseContainer.lastElementChild.remove();
            addBotMessageToScreen("통신 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };


    // 옵션 버튼 클릭 이벤트 핸들러
    mainOptions.addEventListener('click', (event) => {
        const button = event.target.closest('.option-button');
        if (!button) return;

        const action = button.dataset.action;
        const buttonText = button.textContent.trim();

        // 1. 사용자 메시지 (클릭한 버튼) 추가
        addUserMessageToScreen(buttonText);

        // 2. 선택된 옵션에 따른 봇 응답 생성 (하드코딩된 정보 표시)
        if (action === 'ces-schedule') {
            const botResponseHtml = `
                <div class="message bot-message">
                    <img src="chatbot_logo.jpg" alt="CES AI Logo" class="bot-avatar ces-logo">
                    <div class="message-content response-bubble">
                        <div class="schedule-title">💻 CES 2026 일정</div>
                        <p>**[CES 2026 전시 일정]**</p>
                        <ul class="schedule-list">
                            <li>**\*1월 6일(화) 10AM-6PM**</li>
                            <li>**\*1월 7일(수) 9AM-6PM**</li>
                            <li>**\*1월 8일(목) 9AM-6PM**</li>
                            <li>**\*1월 9일(금) 9AM-4PM**</li>
                        </ul>
                    </div>
                </div>
            `;
            responseContainer.insertAdjacentHTML('beforeend', botResponseHtml);
            // 옵션 버튼은 유지하여 다른 메뉴 선택 가능하게 함
            
        } else {
            // 다른 버튼 클릭 시 API 호출을 대신하여 일반적인 텍스트 응답 추가
            addBotMessageToScreen(`**${buttonText}**에 대한 자세한 정보는 AI가 곧 답변해 드릴 수 있도록 준비 중입니다. 잠시만 기다려주세요!`);
            
            // 또는 API를 호출하고 싶다면:
            // callApiAndGetResponse(buttonText); 
        }

        scrollToBottom();
    });

    // 메시지 입력 후 전송 버튼 클릭 이벤트
    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            // 1. 사용자 메시지 UI에 추가
            addUserMessageToScreen(message);
            
            // 2. API 호출 (AI 챗봇 로직)
            // callApiAndGetResponse(message); // 실제 API 호출 시 사용
            
            // API 호출 대신 임시 응답 제공 (예시)
            setTimeout(() => {
                addBotMessageToScreen(`AI가 질문: "**${message}**"에 대해 답변을 생성 중입니다.`);
            }, 500);
            
            // 3. 입력 창 비우기
            messageInput.value = '';
        }
    });
    
    // 엔터 키 입력 시 전송
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // 기본 엔터 동작 방지
            sendButton.click();
        }
    });

    // 초기 로드 시 스크롤 이동
    scrollToBottom();
});
document.addEventListener('DOMContentLoaded', () => {
    const mainOptions = document.getElementById('main-options');
    const responseContainer = document.getElementById('response-container');
    const chatBody = document.getElementById('chat-body');
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');

    const API_ENDPOINT = 'YOUR_CHATBOT_API_ENDPOINT'; 

    // **새로운 함수: 마크다운 텍스트를 HTML로 변환 (굵은 글씨)**
    const formatTextForDisplay = (text) => {
        if (!text) return '';
        // **...** 패턴을 <strong>...</strong> 태그로 변환
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    };

    // 스크롤을 가장 아래로 이동하는 함수
    const scrollToBottom = () => {
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    /**
     * 사용자 메시지를 화면에 추가하는 함수
     * @param {string} message - 사용자 입력 메시지
     */
    const addUserMessageToScreen = (message) => {
        // 메시지 추가 시 포맷팅 함수 적용
        const formattedMessage = formatTextForDisplay(message);
        const userMessageHtml = `
            <div class="message user-message" style="margin-bottom: 10px;">
                <div class="message-content text-bubble">
                    ${formattedMessage}
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
        // 메시지 추가 시 포맷팅 함수 적용
        const formattedMessage = formatTextForDisplay(message);
        const botMessageHtml = `
            <div class="message bot-message" style="margin-bottom: 15px;">
                <div class="bot-avatar ces-logo"><img src="chatbot_logo.jpg" alt="CES AI Logo"></div>
                <div class="message-content text-bubble">
                    ${formattedMessage}
                </div>
            </div>
        `;
        responseContainer.insertAdjacentHTML('beforeend', botMessageHtml);
        scrollToBottom();
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
            
            // **하드코딩된 응답 텍스트에 ** 굵은 글씨 적용**
            const responseText = `
                <div class="schedule-title">💻 CES 2026 일정</div>
                <p><strong>[CES 2026 전시 일정]</strong></p>
                <ul class="schedule-list">
                    <li>*1월 6일(화) 10AM-6PM</li>
                    <li>*1월 7일(수) 9AM-6PM</li>
                    <li>*1월 8일(목) 9AM-6PM</li>
                    <li>*1월 9일(금) 9AM-4PM</li>
                </ul>
            `;
            
            const botResponseHtml = `
                <div class="message bot-message">
                    <div class="bot-avatar ces-logo"><img src="chatbot_logo.jpg" alt="CES AI Logo"></div>
                    <div class="message-content response-bubble">
                        ${responseText}
                    </div>
                </div>
            `;
            responseContainer.insertAdjacentHTML('beforeend', botResponseHtml);
            
        } else {
            // 다른 버튼 클릭 시 일반적인 텍스트 응답 추가 시에도 ** 포맷 적용
            addBotMessageToScreen(`**${buttonText}** 정보에 대해 AI가 답변을 준비 중입니다. 잠시만 기다려주세요.`);
        }

        scrollToBottom();
    });

    // 메시지 입력 후 전송 버튼 클릭 이벤트
    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            // 1. 사용자 메시지 UI에 추가
            addUserMessageToScreen(message);
            
            // 2. API 호출 대신 임시 응답 제공 (예시)
            setTimeout(() => {
                // 임시 응답에도 ** 포맷 적용
                addBotMessageToScreen(`AI가 질문: "**${message}**"에 대해 답변을 생성 중입니다.`);
            }, 500);
            
            // 3. 입력 창 비우기
            messageInput.value = '';
        }
    });
    
    // 엔터 키 입력 시 전송
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            sendButton.click();
        }
    });

    // 초기 로드 시 스크롤 이동
    scrollToBottom();
});
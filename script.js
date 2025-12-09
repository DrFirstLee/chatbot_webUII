document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM 요소 선택
    const chatBody = document.getElementById('chat-body');
    const landingView = document.getElementById('landing-view');
    const responseContainer = document.getElementById('response-container');
    
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const pillButtons = document.querySelectorAll('.pill-btn');

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
        // 부드럽게 스크롤
        chatBody.scrollTo({
            top: chatBody.scrollHeight,
            behavior: 'smooth'
        });
    }

    // ★ 핵심 변경 사항: 랜딩 페이지를 숨기지 않음
    function activateChatContainer() {
        // responseContainer가 숨겨져 있다면 보이게 설정
        if (responseContainer.style.display === 'none' || responseContainer.style.display === '') {
            responseContainer.style.display = 'flex';
            responseContainer.style.flexDirection = 'column';
        }
        
        // landingView.style.display = 'none';  <-- 이 줄을 삭제하여 랜딩 페이지가 유지되게 함
    }

    // 텍스트 포맷팅 (**굵게** -> <b>굵게</b>)
    function formatText(text) {
        if (!text) return "";
        return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    }

    // ----------------------------------------------------------------
    // 3. 메시지 추가 함수
    // ----------------------------------------------------------------

    // 사용자 메시지 추가
    function addUserMessage(text) {
        activateChatContainer(); // 대화 컨테이너 활성화

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'user-message');
        messageDiv.innerHTML = `
            <div class="text-bubble user-bubble">
                ${formatText(text)}
            </div>
        `;
        responseContainer.appendChild(messageDiv);
        scrollToBottom(); // 메시지 추가 후 스크롤 내리기
    }

    // 봇 메시지 추가
    function addBotMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'bot-message');
        
        messageDiv.innerHTML = `
            <div class="bot-avatar">
                <img src="chatbot_logo.jpg" alt="AI">
            </div>
            <div class="text-bubble bot-bubble">
                ${formatText(text)}
            </div>
        `;
        responseContainer.appendChild(messageDiv);
        scrollToBottom(); // 메시지 추가 후 스크롤 내리기
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

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            // 로딩 메시지 제거
            if (responseContainer.lastElementChild) {
                responseContainer.lastElementChild.remove();
            }

            // 실제 답변 표시
            const botAnswer = data.answer || "죄송합니다. 답변을 가져올 수 없습니다.";
            addBotMessage(botAnswer);

        } catch (error) {
            console.error(error);
            if (responseContainer.lastElementChild) {
                responseContainer.lastElementChild.remove();
            }
            addBotMessage("서버와 통신 중 오류가 발생했습니다.");
        }
    }

    // ----------------------------------------------------------------
    // 5. 이벤트 리스너
    // ----------------------------------------------------------------

    // 질문 버튼(pill-btn) 클릭 시
    pillButtons.forEach(button => {
        button.addEventListener('click', () => {
            const text = button.innerText.trim();
            
            addUserMessage(text);
            callApiAndGetResponse(text);
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
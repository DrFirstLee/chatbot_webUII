document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM 요소 선택
    const chatBody = document.getElementById('chat-body');
    const landingView = document.getElementById('landing-view'); // 초기 질문 버튼 화면
    const responseContainer = document.getElementById('response-container'); // 대화가 쌓이는 곳
    
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const pillButtons = document.querySelectorAll('.pill-btn'); // 질문 버튼들

    // 모달 관련 요소
    const moreOptionsBtn = document.querySelector('.more-options');
    const modalOverlay = document.getElementById('contactModal');
    const closeModalBtn = document.querySelector('.close-button');

    // API 엔드포인트 (프록시 경로)
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

    // ★ 핵심: 초기 화면을 숨기고 채팅 화면을 보여주는 함수
    function switchToChatView() {
        if (landingView.style.display !== 'none') {
            landingView.style.display = 'none'; // 초기 화면 숨김
            responseContainer.style.display = 'flex'; // 대화창 보임
            responseContainer.style.flexDirection = 'column'; // 세로 정렬 확실히 지정
        }
    }

    // 텍스트 포맷팅 (**굵게** -> <b>굵게</b>)
    function formatText(text) {
        if (!text) return "";
        return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    }

    // ----------------------------------------------------------------
    // 3. 메시지 추가 함수 (사용자 / 봇)
    // ----------------------------------------------------------------

    // 사용자 메시지 추가
    function addUserMessage(text) {
        switchToChatView(); // 메시지 추가 시 강제로 채팅 화면으로 전환

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
        
        // 챗봇 로고 이미지 (경로 확인 필요)
        messageDiv.innerHTML = `
            <div class="bot-avatar">
                <img src="chatbot_logo.jpg" alt="AI">
            </div>
            <div class="text-bubble bot-bubble">
                ${formatText(text)}
            </div>
        `;
        responseContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    // ----------------------------------------------------------------
    // 4. API 호출 로직
    // ----------------------------------------------------------------
    async function callApiAndGetResponse(userMessage) {
        // '답변 생성 중' 로딩 메시지 표시
        addBotMessage("...답변을 생성하고 있습니다...");

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMessage })
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            // 로딩 메시지 삭제 (마지막 메시지 제거)
            responseContainer.lastElementChild.remove();

            // 실제 답변 표시
            const botAnswer = data.answer || "죄송합니다. 답변을 가져올 수 없습니다.";
            addBotMessage(botAnswer);

        } catch (error) {
            console.error(error);
            // 로딩 메시지 삭제
            if (responseContainer.lastElementChild) {
                responseContainer.lastElementChild.remove();
            }
            addBotMessage("서버와 통신 중 오류가 발생했습니다.");
        }
    }

    // ----------------------------------------------------------------
    // 5. 이벤트 리스너 (버튼 클릭, 입력 등)
    // ----------------------------------------------------------------

    // ★ 질문 버튼(pill-btn) 클릭 시 이벤트 처리
    pillButtons.forEach(button => {
        button.addEventListener('click', () => {
            const text = button.innerText.trim(); // 버튼에 적힌 텍스트 가져오기
            
            // 1. 사용자 말풍선 추가 (화면 전환 포함)
            addUserMessage(text);
            
            // 2. API 호출하여 답변 받기
            callApiAndGetResponse(text);
        });
    });

    // 전송 버튼 클릭 및 엔터키 처리 함수
    function handleSendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;
        
        messageInput.value = ''; // 입력창 비우기
        addUserMessage(text);    // 사용자 메시지 추가
        callApiAndGetResponse(text); // API 호출
    }

    sendButton.addEventListener('click', handleSendMessage);
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });

    // 모달 팝업 관련 (기존 유지)
    if (moreOptionsBtn && modalOverlay) {
        moreOptionsBtn.addEventListener('click', () => modalOverlay.style.display = 'flex');
        closeModalBtn.addEventListener('click', () => modalOverlay.style.display = 'none');
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) modalOverlay.style.display = 'none';
        });
    }
});
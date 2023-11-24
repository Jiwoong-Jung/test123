document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
  
    // 메시지 수신
    socket.on('chat message', (msg) => {
      const ul = document.getElementById('messages');
      const li = document.createElement('li');
      li.textContent = msg;
      ul.appendChild(li);
    });
  
    // WebRTC 코드 추가
    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    const peerConnection = new RTCPeerConnection(configuration);
  
    // 로컬 비디오 스트림 가져오기
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = stream;
        peerConnection.addStream(stream);
  
        // WebRTC 연결을 위한 이벤트 핸들러 추가
        socket.on('offer', (offer, targetSocketId) => {
          peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  
          // 응답 생성
          peerConnection.createAnswer()
            .then((answer) => peerConnection.setLocalDescription(answer))
            .then(() => {
              socket.emit('answer', peerConnection.localDescription, targetSocketId);
            });
        });
  
        socket.on('answer', (answer) => {
          peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });
  
        socket.on('ice-candidate', (candidate) => {
          peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        });
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });
  
    // ICE candidate 생성 및 전송
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', event.candidate);
      }
    };
  
    // 리모트 비디오 스트림 설정
    peerConnection.onaddstream = (event) => {
      const remoteVideo = document.getElementById('remoteVideo');
      remoteVideo.srcObject = event.stream;
    };
  
    // 폼 제출
    document.getElementById('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('m');
      const message = input.value.trim();
      if (message !== '') {
        socket.emit('chat message', message);
        input.value = '';
      }
    });
  });
  
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
  
    // �޽��� ����
    socket.on('chat message', (msg) => {
      const ul = document.getElementById('messages');
      const li = document.createElement('li');
      li.textContent = msg;
      ul.appendChild(li);
    });
  
    // WebRTC �ڵ� �߰�
    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    const peerConnection = new RTCPeerConnection(configuration);
  
    // ���� ���� ��Ʈ�� ��������
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = stream;
        peerConnection.addStream(stream);
  
        // WebRTC ������ ���� �̺�Ʈ �ڵ鷯 �߰�
        socket.on('offer', (offer, targetSocketId) => {
          peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  
          // ���� ����
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
  
    // ICE candidate ���� �� ����
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', event.candidate);
      }
    };
  
    // ����Ʈ ���� ��Ʈ�� ����
    peerConnection.onaddstream = (event) => {
      const remoteVideo = document.getElementById('remoteVideo');
      remoteVideo.srcObject = event.stream;
    };
  
    // �� ����
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
  
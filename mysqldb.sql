DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertMessage`(
IN p_messageTopic VARCHAR(20),
IN p_messageBuffer VARCHAR(150),
IN p_messageKafkaTimestamp TIMESTAMP)
BEGIN
INSERT INTO tbl_messages (messageTopic,messageBuffer,messageKafkaTimestamp) values(p_messageTopic,p_messageBuffer,p_messageKafkaTimestamp);
END$$
DELIMITER ;


// 通过ncfxy-include标签来载入静态文件
function includeFiles(){
	$('[ncfxy-include]').each(function(){
		var filename = $(this).attr('ncfxy-include');
		var target = $(this);
		$.get({
			url: filename,
			async: false		// 同步进行加载
		}).done(function(data){
			target.html(data);
		}).fail(function(data){
			target.html(data.responseText);
		});
	});
}
